const token = localStorage.getItem('token');
let todosOsPedidos = [];
let clientesMap = {};
let produtosMap = {};
let itensPorPedido = {};
let detalhesAbertos = null;

const ROTULO_PAGAMENTO = { dinheiro: 'Dinheiro', pix: 'Pix', cartao: 'Cartão' };

async function carregarClientesMap() {
  const resposta = await fetch('http://localhost:3000/clientes?todos=1', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const clientes = await resposta.json();
  clientesMap = {};
  clientes.forEach(c => { clientesMap[c.id] = c; });
}

async function carregarProdutosMap() {
  const resposta = await fetch('http://localhost:3000/produtos?todos=1', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const produtos = await resposta.json();
  produtosMap = {};
  produtos.forEach(p => { produtosMap[p.id] = p; });
}

async function carregarItensPorPedido() {
  const resposta = await fetch('http://localhost:3000/itens-pedido', {
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

  fetch('http://localhost:3000/pedidos', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(pedidos => {
      todosOsPedidos = pedidos;
      renderizarHistorico(pedidos);
    });
}

function renderizarHistorico(pedidos) {
  const corpo = document.getElementById('corpoHistorico');
  corpo.innerHTML = '';
  detalhesAbertos = null;

  if (pedidos.length === 0) {
    corpo.innerHTML = '<tr><td colspan="6">Nenhuma venda encontrada.</td></tr>';
    return;
  }

  pedidos.forEach(pedido => {
    const cliente = clientesMap[pedido.cliente_id];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${pedido.id}</td>
      <td>${formatarData(pedido.data_pedido)}</td>
      <td>${cliente ? cliente.nome : '-'}</td>
      <td>${ROTULO_PAGAMENTO[pedido.forma_pagamento] || pedido.forma_pagamento || '-'}</td>
      <td>R$ ${pedido.total}</td>
      <td><button type="button" class="btn-ver-detalhes btn-editar-linha" data-id="${pedido.id}">Ver detalhes</button></td>
    `;
    corpo.appendChild(tr);

    const trDetalhes = document.createElement('tr');
    trDetalhes.className = 'linha-detalhes-pedido';
    trDetalhes.dataset.pedidoId = pedido.id;
    trDetalhes.style.display = 'none';
    trDetalhes.innerHTML = `<td colspan="6"></td>`;
    corpo.appendChild(trDetalhes);
  });

  document.querySelectorAll('.btn-ver-detalhes').forEach(btn => {
    btn.addEventListener('click', () => alternarDetalhes(parseInt(btn.dataset.id)));
  });
}

function alternarDetalhes(pedidoId) {
  const jaAberto = detalhesAbertos === pedidoId;

  document.querySelectorAll('.linha-detalhes-pedido').forEach(tr => {
    tr.style.display = 'none';
    tr.querySelector('td').innerHTML = '';
  });

  if (jaAberto) {
    detalhesAbertos = null;
    return;
  }

  detalhesAbertos = pedidoId;
  const trDetalhes = document.querySelector(`.linha-detalhes-pedido[data-pedido-id="${pedidoId}"]`);
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

  trDetalhes.querySelector('td').innerHTML = `<div class="detalhes-pedido-conteudo">${itensHtml}</div>`;
  trDetalhes.style.display = '';
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
