const token = localStorage.getItem('token');

let produtosDisponiveisCusto = [];
let insumosDisponiveis = [];
let fichaTecnicaAtual = [];
let produtoSelecionadoId = null;
// O schema nao guarda "rendimento" por produto (nao existe esse campo em
// produtos nem em ficha_tecnica) - por isso o rendimento e' um valor apenas
// local/calculadora: nao e' salvo em lugar nenhum, so divide o custo total
// da receita ja calculada a partir dos insumos reais cadastrados no banco.
let rendimentoAtual = 1;

const MARGENS_PRESET = [100, 150, 200, 300];
let margemSelecionada = null;

function formatarMoeda(valor) {
  return 'R$ ' + (valor || 0).toFixed(2).replace('.', ',');
}

async function carregarProdutosCusto() {
  const resposta = await fetch(`${API_URL}/produtos?todos=1`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  produtosDisponiveisCusto = await resposta.json();

  const select = document.getElementById('selectProdutoCusto');
  select.innerHTML = '<option value="">Selecione um produto</option>' +
    produtosDisponiveisCusto.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
}

async function carregarInsumos() {
  const resposta = await fetch(`${API_URL}/insumos`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  insumosDisponiveis = await resposta.json();

  const select = document.getElementById('selectInsumo');
  select.innerHTML = insumosDisponiveis.map(i =>
    `<option value="${i.id}">${i.nome} — ${formatarMoeda(parseFloat(i.custo_por_unidade))}/${i.unidade_medida}</option>`
  ).join('');

  renderizarInsumosCadastrados();
}

function renderizarInsumosCadastrados() {
  const container = document.getElementById('listaInsumosCadastrados');

  if (insumosDisponiveis.length === 0) {
    container.innerHTML = '<p class="ts-small">Nenhum insumo cadastrado ainda.</p>';
    return;
  }

  container.innerHTML = insumosDisponiveis.map(i => `
    <div class="item-adicionado">
      <span>${i.nome} — ${formatarMoeda(parseFloat(i.custo_por_unidade))} / ${i.unidade_medida}</span>
      <div class="acoes-linha">
        <button type="button" class="btn-editar-linha btn-editar-insumo" data-id="${i.id}">Editar</button>
        <button type="button" class="btn-excluir-linha btn-excluir-insumo" data-id="${i.id}">Excluir</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.btn-editar-insumo').forEach(btn => {
    const insumo = insumosDisponiveis.find(i => i.id === parseInt(btn.dataset.id));
    btn.addEventListener('click', () => editarInsumo(insumo));
  });

  document.querySelectorAll('.btn-excluir-insumo').forEach(btn => {
    btn.addEventListener('click', () => excluirInsumo(parseInt(btn.dataset.id)));
  });
}

document.getElementById('btnSalvarInsumo').addEventListener('click', async () => {
  const nome = document.getElementById('nomeInsumo').value;
  const unidade_medida = document.getElementById('unidadeInsumo').value;
  const custo_por_unidade = document.getElementById('custoInsumo').value;

  if (!nome || !custo_por_unidade) {
    alert('Informe ao menos o nome e o custo do insumo.');
    return;
  }

  await fetch(`${API_URL}/insumos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ nome, unidade_medida, custo_por_unidade })
  });

  document.getElementById('nomeInsumo').value = '';
  document.getElementById('custoInsumo').value = '';

  mostrarToast('Insumo salvo com sucesso!');
  await carregarInsumos();
  await carregarFichaTecnica();
});

async function editarInsumo(insumo) {
  const nome = prompt('Nome:', insumo.nome);
  if (nome === null) return;
  const unidade_medida = prompt('Unidade (g, kg, ml, l, unidade):', insumo.unidade_medida);
  if (unidade_medida === null) return;
  const custo_por_unidade = prompt('Custo por unidade:', insumo.custo_por_unidade);
  if (custo_por_unidade === null) return;

  await fetch(`${API_URL}/insumos/` + insumo.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ nome, unidade_medida, custo_por_unidade })
  });

  mostrarToast('Insumo atualizado com sucesso!');
  await carregarInsumos();
  await carregarFichaTecnica();
}

async function excluirInsumo(id) {
  if (!confirm('Excluir este insumo? Isso também remove ele de qualquer ficha técnica que o use.')) return;

  await fetch(`${API_URL}/insumos/` + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });

  mostrarToast('Insumo excluído.');
  await carregarInsumos();
  await carregarFichaTecnica();
}

document.getElementById('selectProdutoCusto').addEventListener('change', (e) => {
  produtoSelecionadoId = e.target.value ? parseInt(e.target.value) : null;
  carregarFichaTecnica();
});

async function carregarFichaTecnica() {
  const container = document.getElementById('listaInsumosFicha');

  if (!produtoSelecionadoId) {
    fichaTecnicaAtual = [];
    container.innerHTML = '<p class="ts-small">Selecione um produto para montar a ficha técnica.</p>';
    atualizarResumoCusto();
    return;
  }

  const resposta = await fetch(`${API_URL}/ficha-tecnica/produto/${produtoSelecionadoId}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  fichaTecnicaAtual = await resposta.json();

  renderizarFichaTecnica();
  atualizarResumoCusto();
}

function renderizarFichaTecnica() {
  const container = document.getElementById('listaInsumosFicha');

  if (fichaTecnicaAtual.length === 0) {
    container.innerHTML = '<p class="ts-small">Nenhum insumo na ficha técnica deste produto ainda.</p>';
    return;
  }

  container.innerHTML = fichaTecnicaAtual.map(item => {
    const qtd = parseFloat(item.quantidade_usada);
    const custo = qtd * parseFloat(item.custo_por_unidade);
    return `
      <div class="item-adicionado">
        <span>${item.nome} — ${qtd} ${item.unidade_medida} · ${formatarMoeda(custo)}</span>
        <button type="button" class="btn-remover-item" data-id="${item.id}">✕</button>
      </div>
    `;
  }).join('');

  document.querySelectorAll('#listaInsumosFicha .btn-remover-item').forEach(btn => {
    btn.addEventListener('click', () => removerItemFicha(parseInt(btn.dataset.id)));
  });
}

document.getElementById('btnAddInsumoFicha').addEventListener('click', async () => {
  if (!produtoSelecionadoId) {
    alert('Selecione um produto primeiro.');
    return;
  }

  const insumoId = parseInt(document.getElementById('selectInsumo').value);
  const quantidade_usada = parseFloat(document.getElementById('qtdInsumoFicha').value);

  if (!insumoId || isNaN(quantidade_usada) || quantidade_usada <= 0) {
    alert('Escolha um insumo e informe uma quantidade válida.');
    return;
  }

  await fetch(`${API_URL}/ficha-tecnica`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ produto_id: produtoSelecionadoId, insumo_id: insumoId, quantidade_usada })
  });

  document.getElementById('qtdInsumoFicha').value = '';
  await carregarFichaTecnica();
});

async function removerItemFicha(id) {
  await fetch(`${API_URL}/ficha-tecnica/` + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  await carregarFichaTecnica();
}

function custoTotalReceita() {
  return fichaTecnicaAtual.reduce((soma, item) => soma + parseFloat(item.quantidade_usada) * parseFloat(item.custo_por_unidade), 0);
}

function atualizarResumoCusto() {
  const total = custoTotalReceita();
  const porUnidade = total / rendimentoAtual;

  document.getElementById('custoTotalReceita').textContent = formatarMoeda(total);
  document.getElementById('rendimentoTexto').textContent = `${rendimentoAtual} un.`;
  document.getElementById('custoPorUnidade').textContent = formatarMoeda(porUnidade);

  atualizarPrecoSugerido(porUnidade);
}

function renderizarBotoesMargem() {
  const container = document.getElementById('botoesMargem');
  container.innerHTML = MARGENS_PRESET.map(m =>
    `<button type="button" class="botao-margem${margemSelecionada === m ? ' botao-margem-ativo' : ''}" data-margem="${m}">${m}%</button>`
  ).join('');

  document.querySelectorAll('.botao-margem').forEach(btn => {
    btn.addEventListener('click', () => {
      margemSelecionada = parseInt(btn.dataset.margem);
      renderizarBotoesMargem();
      atualizarResumoCusto();
    });
  });
}

function atualizarPrecoSugerido(custoPorUnidade) {
  const nota = document.getElementById('notaSugerido');

  if (margemSelecionada === null) {
    document.getElementById('precoSugerido').textContent = formatarMoeda(0);
    nota.textContent = 'Selecione uma margem para calcular.';
    return;
  }

  const preco = custoPorUnidade * (1 + margemSelecionada / 100);
  document.getElementById('precoSugerido').textContent = formatarMoeda(preco);
  nota.textContent = `Markup de ${margemSelecionada}% sobre o custo por unidade.`;
}

document.getElementById('inputRendimento').addEventListener('input', (e) => {
  const valor = parseInt(e.target.value);
  rendimentoAtual = (!isNaN(valor) && valor > 0) ? valor : 1;
  atualizarResumoCusto();
});

document.getElementById('btnMenosRend').addEventListener('click', () => {
  rendimentoAtual = Math.max(1, rendimentoAtual - 1);
  document.getElementById('inputRendimento').value = rendimentoAtual;
  atualizarResumoCusto();
});

document.getElementById('btnMaisRend').addEventListener('click', () => {
  rendimentoAtual += 1;
  document.getElementById('inputRendimento').value = rendimentoAtual;
  atualizarResumoCusto();
});

renderizarBotoesMargem();
carregarProdutosCusto();
carregarInsumos();
atualizarResumoCusto();
