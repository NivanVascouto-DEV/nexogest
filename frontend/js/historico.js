const token = localStorage.getItem('token');
let todosOsPedidos = [];
let clientesMap = {};
let produtosMap = {};
let itensPorPedido = {};
let detalhesAbertos = null;

const ROTULO_PAGAMENTO = { dinheiro: 'Dinheiro', pix: 'Pix', cartao: 'Cartão' };

async function carregarClientesMap() {
  const resposta = await fetch(`${API_URL}/clientes?todos=1`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const clientes = await resposta.json();
  clientesMap = {};
  clientes.forEach(c => { clientesMap[c.id] = c; });
}

async function carregarProdutosMap() {
  const resposta = await fetch(`${API_URL}/produtos?todos=1`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const produtos = await resposta.json();
  produtosMap = {};
  produtos.forEach(p => { produtosMap[p.id] = p; });
}

async function carregarItensPorPedido() {
  const resposta = await fetch(`${API_URL}/itens-pedido`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const itens = await resposta.json();
  itensPorPedido = {};
  itens.forEach(item => {
    if (!itensPorPedido[item.pedido_id]) itensPorPedido[item.pedido_id] = [];
    itensPorPedido[item.pedido_id].push(item);
  });
}

async function carregarHistorico() {
  await Promise.all([carregarClientesMap(), carregarProdutosMap(), carregarItensPorPedido()]);

  fetch(`${API_URL}/pedidos`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(pedidos => {
      todosOsPedidos = pedidos;
      renderizarHistorico(pedidos);
    });
}

function renderizarHistorico(pedidos) {
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';
  detalhesAbertos = null;

  const resumo = document.getElementById('resumoHistorico');
  const totalVendas = pedidos.reduce((soma, p) => soma + (parseFloat(p.total) || 0), 0);
  resumo.innerHTML = pedidos.length === 0
    ? ''
    : `${pedidos.length} venda${pedidos.length > 1 ? 's' : ''} · <strong>R$ ${totalVendas.toFixed(2)}</strong>`;

  if (pedidos.length === 0) {
    lista.innerHTML = '<p class="ts-small">Nenhuma venda encontrada.</p>';
    return;
  }

  pedidos.forEach(pedido => {
    const cliente = clientesMap[pedido.cliente_id];
    const card = document.createElement('div');
    card.className = 'card-historico';
    card.dataset.pedidoId = pedido.id;
    card.innerHTML = `
      <div class="card-historico-linha">
        <span class="card-historico-id">#${pedido.id}</span>
        <div class="card-historico-info">
          <div class="card-historico-cliente">${cliente ? cliente.nome : 'Cliente não identificado'}</div>
          <div class="card-historico-meta">${formatarData(pedido.data_pedido)} · ${ROTULO_PAGAMENTO[pedido.forma_pagamento] || pedido.forma_pagamento || '-'}</div>
        </div>
        <span class="card-historico-total">R$ ${pedido.total}</span>
        <button type="button" class="btn-ver-detalhes" data-id="${pedido.id}">Detalhes</button>
      </div>
      <div class="card-historico-detalhes" style="display:none"></div>
    `;
    lista.appendChild(card);
  });

  document.querySelectorAll('.btn-ver-detalhes').forEach(btn => {
    btn.addEventListener('click', () => alternarDetalhes(parseInt(btn.dataset.id)));
  });
}

function alternarDetalhes(pedidoId) {
  const jaAberto = detalhesAbertos === pedidoId;

  document.querySelectorAll('.card-historico-detalhes').forEach(div => {
    div.style.display = 'none';
    div.innerHTML = '';
  });

  if (jaAberto) {
    detalhesAbertos = null;
    return;
  }

  detalhesAbertos = pedidoId;
  const card = document.querySelector(`.card-historico[data-pedido-id="${pedidoId}"]`);
  const detalhes = card.querySelector('.card-historico-detalhes');
  const itens = itensPorPedido[pedidoId] || [];

  const itensHtml = itens.length === 0
    ? '<p class="ts-small">Sem itens registrados.</p>'
    : itens.map(item => {
        const produto = produtosMap[item.produto_id];
        const nome = produto ? produto.nome : 'Produto';
        const qtd = parseFloat(item.quantidade);
        const preco = parseFloat(item.preco_unitario);
        return `<div class="resumo-linha"><span>${qtd}x ${nome} — R$ ${preco.toFixed(2)} cada</span><span>R$ ${(qtd * preco).toFixed(2)}</span></div>`;
      }).join('');

  detalhes.innerHTML = itensHtml;
  detalhes.style.display = 'block';
}

function formatarData(dataStr) {
  const data = new Date(dataStr);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

document.getElementById('btnFiltrar').addEventListener('click', () => {
  const inicio = document.getElementById('dataInicio').value;
  const fim = document.getElementById('dataFim').value;

  if (!inicio || !fim) {
    renderizarHistorico(todosOsPedidos);
    return;
  }

  const filtrados = todosOsPedidos.filter(p => {
    const dataPedido = p.data_pedido.split('T')[0].split(' ')[0];
    return dataPedido >= inicio && dataPedido <= fim;
  });

  renderizarHistorico(filtrados);
});

carregarHistorico();
