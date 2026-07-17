const token = localStorage.getItem('token');
let todasDespesas = [];

function carregarDRE() {
  fetch(`${API_URL}/relatorios/dre`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(dre => {
      const container = document.getElementById('metricasDRE');
      container.innerHTML = `
        <div class="metrica-card">
          <p class="metrica-label">Receita total</p>
          <p class="metrica-valor">R$ ${dre.receita_bruta.toFixed(2)}</p>
        </div>
        <div class="metrica-card">
          <p class="metrica-label">Lucro bruto</p>
          <p class="metrica-valor">R$ ${dre.lucro_bruto.toFixed(2)}</p>
        </div>
        <div class="metrica-card">
          <p class="metrica-label">Lucro líquido</p>
          <p class="metrica-valor">R$ ${dre.lucro_liquido.toFixed(2)}</p>
        </div>
      `;
    });
}

function carregarPagamentos() {
  fetch(`${API_URL}/relatorios/pagamentos`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(saldos => {
      const container = document.getElementById('metricasPagamento');
      container.innerHTML = `
        <div class="metrica-card"><p class="metrica-label">Dinheiro</p><p class="metrica-valor">R$ ${saldos.dinheiro.toFixed(2)}</p></div>
        <div class="metrica-card"><p class="metrica-label">Cartão</p><p class="metrica-valor">R$ ${saldos.cartao.toFixed(2)}</p></div>
        <div class="metrica-card"><p class="metrica-label">Pix</p><p class="metrica-valor">R$ ${saldos.pix.toFixed(2)}</p></div>
      `;
    });
}

function formatarData(dataISO) {
  if (!dataISO) return '-';
  const data = new Date(dataISO);
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const ano = data.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

function diasAteVencimento(dataISO) {
  if (!dataISO) return null;
  const hoje = new Date();
  const vencimento = new Date(dataISO);
  const diffMs = vencimento.getTime() - Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function renderizarDespesas(despesas) {
  const corpo = document.getElementById('corpoDespesas');
  corpo.innerHTML = '';

  if (despesas.length === 0) {
    corpo.innerHTML = '<tr><td colspan="6">Nenhuma despesa lançada.</td></tr>';
    return;
  }

  despesas.forEach(d => {
    const dias = diasAteVencimento(d.data_vencimento);
    const proximoVencimento = dias !== null && dias <= 7;
    const paga = d.status === 'paga';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.descricao}</td>
      <td>${d.categoria}</td>
      <td>${formatarData(d.data_vencimento)} ${proximoVencimento ? '<span class="badge badge-perigo">Vence em breve</span>' : ''}</td>
      <td>R$ ${d.valor}</td>
      <td><span class="badge ${paga ? 'badge-ok' : 'badge-alerta'}">${paga ? 'Paga' : 'Pendente'}</span></td>
      <td>
        <div class="acoes-linha">
          <button data-id="${d.id}" class="btn-alternar-status-despesa btn-editar-linha">${paga ? 'Marcar como pendente' : 'Marcar como paga'}</button>
          <button data-id="${d.id}" class="btn-excluir-despesa btn-excluir-linha">Excluir</button>
        </div>
      </td>
    `;
    corpo.appendChild(tr);
  });

  document.querySelectorAll('.btn-excluir-despesa').forEach(btn => {
    btn.addEventListener('click', () => excluirDespesa(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.btn-alternar-status-despesa').forEach(btn => {
    btn.addEventListener('click', () => alternarStatusDespesa(parseInt(btn.dataset.id)));
  });
}

async function excluirDespesa(id) {
  if (!confirm('Excluir este lançamento?')) return;
  await fetch(`${API_URL}/lancamentos-financeiros/` + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  carregarDespesas();
  carregarDRE();
  carregarPagamentos();
}

async function alternarStatusDespesa(id) {
  const despesa = todasDespesas.find(d => d.id === id);
  if (!despesa) return;

  const novoStatus = despesa.status === 'paga' ? 'pendente' : 'paga';

  await fetch(`${API_URL}/lancamentos-financeiros/` + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      tipo: despesa.tipo,
      categoria: despesa.categoria,
      descricao: despesa.descricao,
      valor: despesa.valor,
      forma_pagamento: despesa.forma_pagamento,
      status: novoStatus
    })
  });

  mostrarToast(novoStatus === 'paga' ? 'Despesa marcada como paga!' : 'Despesa marcada como pendente.');
  carregarDespesas();
  carregarPagamentos();
}

function paraDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function definirPeriodoPadraoMesAtual() {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  document.getElementById('dataInicioFin').value = paraDataInput(primeiroDia);
  document.getElementById('dataFimFin').value = paraDataInput(ultimoDia);
}

function aplicarFiltroDatas() {
  const inicio = document.getElementById('dataInicioFin').value;
  const fim = document.getElementById('dataFimFin').value;

  if (!inicio || !fim) {
    renderizarDespesas(todasDespesas);
    return;
  }

  const filtradas = todasDespesas.filter(d => {
    if (!d.data_vencimento) return false;
    const data = d.data_vencimento.split('T')[0].split(' ')[0];
    return data >= inicio && data <= fim;
  });

  renderizarDespesas(filtradas);
}

function carregarDespesas() {
  fetch(`${API_URL}/lancamentos-financeiros`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(lancamentos => {
      todasDespesas = lancamentos.filter(l => l.tipo === 'saida');
      aplicarFiltroDatas();
    });
}

document.getElementById('btnFiltrarFin').addEventListener('click', aplicarFiltroDatas);

document.getElementById('btnSalvarDespesa').addEventListener('click', async () => {
  const descricao = document.getElementById('descricaoDespesa').value;
  const categoria = document.getElementById('categoriaDespesa').value;
  const valor = document.getElementById('valorDespesa').value;
  const forma_pagamento = document.getElementById('formaPagamentoDespesa').value;
  const data_vencimento = document.getElementById('vencimentoDespesa').value;

  await fetch(`${API_URL}/lancamentos-financeiros`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ tipo: 'saida', categoria, descricao, valor, forma_pagamento, data_vencimento })
  });

  document.getElementById('descricaoDespesa').value = '';
  document.getElementById('valorDespesa').value = '';
  document.getElementById('vencimentoDespesa').value = '';

  mostrarToast('Lançamento salvo com sucesso!');
  carregarDespesas();
  carregarDRE();
  carregarPagamentos();
});

definirPeriodoPadraoMesAtual();
carregarDRE();
carregarPagamentos();
carregarDespesas();
