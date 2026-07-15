const token = localStorage.getItem('token');
let produtosDisponiveis = [];
let clientesDisponiveis = [];
let pedidoAtual = [];
let canalSelecionado = 'delivery';

fetch('http://localhost:3000/produtos', {
  headers: { 'Authorization': 'Bearer ' + token }
})
  .then(resposta => resposta.json())
  .then(produtos => {
    produtosDisponiveis = produtos;
    const select = document.getElementById('selectProduto');
    produtos.forEach(produto => {
      const option = document.createElement('option');
      option.value = produto.id;
      option.textContent = `${produto.nome} — R$ ${produto.preco}`;
      select.appendChild(option);
    });
    atualizarModoQuantidade();
  });

fetch('http://localhost:3000/clientes', {
  headers: { 'Authorization': 'Bearer ' + token }
})
  .then(resposta => resposta.json())
  .then(clientes => { clientesDisponiveis = clientes; });

function filtrarClientes(texto) {
  if (!texto || texto.trim().length < 2) return [];
  const termo = texto.trim().toLowerCase();
  return clientesDisponiveis.filter(c =>
    (c.nome && c.nome.toLowerCase().includes(termo)) ||
    (c.telefone && c.telefone.includes(termo))
  ).slice(0, 6);
}

function renderSugestoes(containerId, lista) {
  const container = document.getElementById(containerId);
  if (lista.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.innerHTML = lista.map(c => `<div class="autocomplete-item" data-id="${c.id}">${c.nome} — ${c.telefone}</div>`).join('');
  container.style.display = 'block';

  container.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => {
      const cliente = lista.find(c => c.id === parseInt(item.dataset.id));
      preencherCliente(cliente);
    });
  });
}

function preencherCliente(cliente) {
  document.getElementById('nomeCliente').value = cliente.nome || '';
  document.getElementById('telefoneCliente').value = cliente.telefone || '';
  document.getElementById('enderecoCliente').value = cliente.endereco || '';
  document.getElementById('listaSugestoesNome').style.display = 'none';
  document.getElementById('listaSugestoesTelefone').style.display = 'none';
}

document.getElementById('nomeCliente').addEventListener('input', (e) => {
  renderSugestoes('listaSugestoesNome', filtrarClientes(e.target.value));
});

document.getElementById('telefoneCliente').addEventListener('input', (e) => {
  renderSugestoes('listaSugestoesTelefone', filtrarClientes(e.target.value));
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#nomeCliente') && !e.target.closest('#listaSugestoesNome')) {
    document.getElementById('listaSugestoesNome').style.display = 'none';
  }
  if (!e.target.closest('#telefoneCliente') && !e.target.closest('#listaSugestoesTelefone')) {
    document.getElementById('listaSugestoesTelefone').style.display = 'none';
  }
});

document.getElementById('btnDelivery').addEventListener('click', () => selecionarCanal('delivery'));
document.getElementById('btnRetirada').addEventListener('click', () => selecionarCanal('retirada'));

function selecionarCanal(canal) {
  canalSelecionado = canal;
  document.getElementById('btnDelivery').classList.toggle('ativo', canal === 'delivery');
  document.getElementById('btnRetirada').classList.toggle('ativo', canal === 'retirada');
}

// ---- Calculadora de peso/valor para produtos vendidos por kg ----

function produtoSelecionadoEhKg() {
  const produtoId = parseInt(document.getElementById('selectProduto').value);
  const produto = produtosDisponiveis.find(p => p.id === produtoId);
  return produto && produto.unidade_venda === 'kg';
}

function atualizarModoQuantidade() {
  const ehKg = produtoSelecionadoEhKg();
  document.getElementById('quantidadeItem').style.display = ehKg ? 'none' : '';
  document.getElementById('calculadoraKg').style.display = ehKg ? 'flex' : 'none';
  if (ehKg) {
    document.getElementById('pesoGramas').value = '';
    document.getElementById('valorDesejadoKg').value = '';
  }
}

document.getElementById('selectProduto').addEventListener('change', atualizarModoQuantidade);

document.getElementById('pesoGramas').addEventListener('input', () => {
  const produtoId = parseInt(document.getElementById('selectProduto').value);
  const produto = produtosDisponiveis.find(p => p.id === produtoId);
  if (!produto) return;

  const gramas = parseFloat(document.getElementById('pesoGramas').value);
  if (isNaN(gramas)) {
    document.getElementById('valorDesejadoKg').value = '';
    return;
  }

  const valor = (gramas / 1000) * parseFloat(produto.preco);
  document.getElementById('valorDesejadoKg').value = valor.toFixed(2);
});

document.getElementById('valorDesejadoKg').addEventListener('input', () => {
  const produtoId = parseInt(document.getElementById('selectProduto').value);
  const produto = produtosDisponiveis.find(p => p.id === produtoId);
  if (!produto) return;

  const valor = parseFloat(document.getElementById('valorDesejadoKg').value);
  if (isNaN(valor)) {
    document.getElementById('pesoGramas').value = '';
    return;
  }

  const gramas = (valor / parseFloat(produto.preco)) * 1000;
  document.getElementById('pesoGramas').value = gramas.toFixed(0);
});

document.getElementById('btnAdicionarItem').addEventListener('click', () => {
  const produtoId = parseInt(document.getElementById('selectProduto').value);
  const produto = produtosDisponiveis.find(p => p.id === produtoId);
  if (!produto) return;

  let quantidade;
  if (produto.unidade_venda === 'kg') {
    const gramas = parseFloat(document.getElementById('pesoGramas').value);
    if (isNaN(gramas) || gramas <= 0) {
      alert('Informe um peso válido maior que zero.');
      return;
    }
    quantidade = gramas / 1000;
  } else {
    quantidade = parseInt(document.getElementById('quantidadeItem').value) || 1;
  }

  const existente = pedidoAtual.find(item => item.produto_id === produtoId);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    pedidoAtual.push({ produto_id: produtoId, nome: produto.nome, preco: parseFloat(produto.preco), quantidade: quantidade, unidade: produto.unidade_venda });
  }

  document.getElementById('quantidadeItem').value = 1;
  document.getElementById('pesoGramas').value = '';
  document.getElementById('valorDesejadoKg').value = '';
  atualizarListaItens();
});

function removerItem(produtoId) {
  pedidoAtual = pedidoAtual.filter(item => item.produto_id !== produtoId);
  atualizarListaItens();
}

function calcularTotal() {
  return pedidoAtual.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

function rotuloQuantidade(item) {
  return item.unidade === 'kg' ? `${(item.quantidade * 1000).toFixed(0)}g` : `${item.quantidade}x`;
}

function totalFinal() {
  const totalInput = document.getElementById('totalEditavel');
  const valor = parseFloat(totalInput.value);
  return isNaN(valor) ? calcularTotal() : valor;
}

function atualizarListaItens() {
  const container = document.getElementById('listaItensPedido');

  if (pedidoAtual.length === 0) {
    container.innerHTML = '<p class="ts-small">Nenhum item adicionado ainda.</p>';
  } else {
    container.innerHTML = pedidoAtual.map(item => `
      <div class="item-adicionado">
        <span>${rotuloQuantidade(item)} ${item.nome} — R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        <button type="button" class="btn-remover-item" data-id="${item.produto_id}">✕</button>
      </div>
    `).join('');

    document.querySelectorAll('.btn-remover-item').forEach(btn => {
      btn.addEventListener('click', () => removerItem(parseInt(btn.dataset.id)));
    });
  }

  atualizarResumo();
}

function atualizarResumo() {
  const resumo = document.getElementById('resumoCaixa');
  const total = calcularTotal();
  document.getElementById('totalEditavel').value = total.toFixed(2);

  if (pedidoAtual.length === 0) {
    resumo.innerHTML = '';
  } else {
    resumo.innerHTML = pedidoAtual.map(item => `
      <div class="resumo-linha"><span>${item.nome} (${rotuloQuantidade(item)})</span><span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span></div>
    `).join('') + `<div class="resumo-total"><span>Total</span><span class="valor">R$ ${total.toFixed(2)}</span></div>`;
  }

  atualizarTroco();
}

function atualizarTroco() {
  const total = totalFinal();
  const valorRecebido = parseFloat(document.getElementById('valorRecebido').value);
  const resultado = document.getElementById('resultadoTroco');

  if (isNaN(valorRecebido)) {
    resultado.textContent = '';
    resultado.className = 'troco-resultado';
    return;
  }

  const diferenca = valorRecebido - total;
  if (diferenca < 0) {
    resultado.textContent = `Falta R$ ${Math.abs(diferenca).toFixed(2)}`;
    resultado.className = 'troco-resultado troco-faltando';
  } else {
    resultado.textContent = `Troco: R$ ${diferenca.toFixed(2)}`;
    resultado.className = 'troco-resultado troco-ok';
  }
}

document.getElementById('valorRecebido').addEventListener('input', atualizarTroco);
document.getElementById('totalEditavel').addEventListener('input', atualizarTroco);

async function buscarOuCriarCliente(nome, telefone, endereco) {
  const resposta = await fetch('http://localhost:3000/clientes', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const clientes = await resposta.json();

  const clienteExistente = clientes.find(c => c.telefone === telefone);

  if (clienteExistente) {
    return clienteExistente.id;
  }

  const respostaNovoCliente = await fetch('http://localhost:3000/clientes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ nome: nome || 'Cliente', telefone: telefone, endereco: endereco })
  });

  const novoCliente = await respostaNovoCliente.json();
  return novoCliente.id;
}

document.getElementById('btnFinalizar').addEventListener('click', async () => {
  if (pedidoAtual.length === 0) {
    alert('Adicione ao menos um item ao pedido.');
    return;
  }

  const total = totalFinal();
  const forma_pagamento = document.getElementById('formaPagamento').value;
  const valorRecebidoTexto = document.getElementById('valorRecebido').value;
  const valor_recebido = valorRecebidoTexto ? parseFloat(valorRecebidoTexto) : null;
  const nome = document.getElementById('nomeCliente').value;
  const telefone = document.getElementById('telefoneCliente').value;
  const endereco = document.getElementById('enderecoCliente').value;
  const observacoes = document.getElementById('observacoesPedido').value;
  const clienteId = await buscarOuCriarCliente(nome, telefone, endereco);

  const respostaPedido = await fetch('http://localhost:3000/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      cliente_id: clienteId,
      usuario_id: parseInt(localStorage.getItem('id')),
      canal_venda: canalSelecionado,
      status: 'pendente',
      forma_pagamento: forma_pagamento,
      total: total,
      observacoes: observacoes,
      valor_recebido: valor_recebido
    })
  });

  const pedidoCriado = await respostaPedido.json();

  for (const item of pedidoAtual) {
    await fetch('http://localhost:3000/itens-pedido', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        pedido_id: pedidoCriado.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco
      })
    });
  }

  alert('Pedido finalizado com sucesso!');
  pedidoAtual = [];
  selecionarCanal('delivery');
  document.getElementById('nomeCliente').value = '';
  document.getElementById('telefoneCliente').value = '';
  document.getElementById('enderecoCliente').value = '';
  document.getElementById('observacoesPedido').value = '';
  document.getElementById('valorRecebido').value = '';
  document.getElementById('formaPagamento').value = 'dinheiro';
  atualizarListaItens();

  fetch('http://localhost:3000/clientes', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(resposta => resposta.json())
    .then(clientes => { clientesDisponiveis = clientes; });
});
