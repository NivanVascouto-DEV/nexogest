const ICONE_OBSERVACAO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l5 5v13H6z"/><path d="M15 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>';

const token = localStorage.getItem('token');
let todosPedidos = [];
let clientesMap = {};
let produtosMap = {};
let itensPorPedido = {};
let abaAtual = 'pendente';

const proximoStatus = {
  pendente: 'preparando',
  preparando: 'saiu_para_entrega',
  saiu_para_entrega: 'entregue'
};

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function capitalizar(texto) {
  if (!texto) return '-';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

async function carregarClientesMap() {
  const resposta = await fetch('http://localhost:3000/clientes', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const clientes = await resposta.json();
  clientesMap = {};
  clientes.forEach(c => { clientesMap[c.id] = c; });
}

async function carregarProdutosMap() {
  const resposta = await fetch('http://localhost:3000/produtos', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const produtos = await resposta.json();
  produtosMap = {};
  produtos.forEach(p => { produtosMap[p.id] = p.nome; });
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

function resumoItens(pedidoId) {
  const itens = itensPorPedido[pedidoId] || [];
  if (itens.length === 0) return 'Sem itens registrados';
  return itens.map(item => `${parseFloat(item.quantidade)}x ${produtosMap[item.produto_id] || 'Produto'}`).join(', ');
}

function carregarPedidos() {
  fetch('http://localhost:3000/pedidos', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(pedidos => {
      todosPedidos = pedidos;
      renderizarPedidos();
    });
}

function renderizarStats() {
  const container = document.getElementById('statsPedidos');
  const contagem = {
    pendente: todosPedidos.filter(p => p.status === 'pendente').length,
    preparando: todosPedidos.filter(p => p.status === 'preparando').length,
    saiu_para_entrega: todosPedidos.filter(p => p.status === 'saiu_para_entrega').length
  };
  container.innerHTML = `
    <div class="stat-card"><p class="stat-numero">${contagem.pendente}</p><p class="stat-rotulo">Pendentes</p></div>
    <div class="stat-card"><p class="stat-numero">${contagem.preparando}</p><p class="stat-rotulo">Preparo</p></div>
    <div class="stat-card"><p class="stat-numero">${contagem.saiu_para_entrega}</p><p class="stat-rotulo">Prontos</p></div>
  `;
}

function atualizarContadoresAbas() {
  document.querySelectorAll('.aba-contador').forEach((span) => {
    const status = span.dataset.contador;
    span.textContent = todosPedidos.filter((p) => p.status === status).length;
  });
}

function renderizarPedidos() {
  renderizarStats();
  atualizarContadoresAbas();

  const container = document.getElementById('listaPedidos');
  container.innerHTML = '';

  const filtrados = todosPedidos.filter(p => p.status === abaAtual);

  if (filtrados.length === 0) {
    container.innerHTML = '<p>Nenhum pedido nesta aba.</p>';
    return;
  }

  filtrados.forEach(pedido => {
    const cliente = clientesMap[pedido.cliente_id];
    const nomeCliente = cliente ? cliente.nome : 'Cliente não identificado';
    const div = document.createElement('div');
    div.className = 'pedido-card';
    div.innerHTML = `
      <div class="pedido-item-topo">
        <div>
          <span class="pedido-tipo">${capitalizar(pedido.canal_venda)}</span><span class="pedido-numero">Pedido #${pedido.id}</span>
          <div class="pedido-nome">${nomeCliente}</div>
          <div class="pedido-itens-resumo">${resumoItens(pedido.id)}</div>
        </div>
        <div class="pedido-total">R$ ${pedido.total}</div>
      </div>
      ${pedido.observacoes && pedido.observacoes.trim() ? `
      <div class="observacao-pedido">
        ${ICONE_OBSERVACAO}
        <span>${pedido.observacoes}</span>
      </div>` : ''}
      <div class="pedido-item-acoes">
        <button data-id="${pedido.id}" class="botao-acao btn-avancar">Avançar</button>
        <button data-id="${pedido.id}" class="botao-acao btn-editar">Editar</button>
        <button data-id="${pedido.id}" class="botao-acao btn-imprimir-cozinha">Imprimir cozinha</button>
        <button data-id="${pedido.id}" class="botao-acao btn-imprimir-cliente">Imprimir cliente</button>
        <button data-id="${pedido.id}" class="botao-acao btn-cancelar">Cancelar</button>
      </div>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll('.btn-avancar').forEach(btn => {
    btn.addEventListener('click', () => mudarStatus(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => editarPedido(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', () => cancelarPedido(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.btn-imprimir-cozinha').forEach(btn => {
    btn.addEventListener('click', () => imprimir(parseInt(btn.dataset.id), 'estabelecimento', btn));
  });

  document.querySelectorAll('.btn-imprimir-cliente').forEach(btn => {
    btn.addEventListener('click', () => imprimir(parseInt(btn.dataset.id), 'cliente', btn));
  });
}

async function imprimir(pedidoId, tipo, btn) {
  const largura = localStorage.getItem('config_largura') || '80';
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Imprimindo...';

  try {
    const resposta = await fetch(`http://localhost:3000/pedidos/${pedidoId}/imprimir/${tipo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ largura: parseInt(largura) })
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      alert(dados.mensagem || 'Não foi possível imprimir. Verifique a impressora.');
    }
  } catch (erro) {
    alert('Não foi possível imprimir. Verifique a conexão com o servidor.');
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
}

async function salvarPedido(pedido, campos) {
  await fetch('http://localhost:3000/pedidos/' + pedido.id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      cliente_id: pedido.cliente_id,
      usuario_id: pedido.usuario_id,
      canal_venda: pedido.canal_venda,
      status: pedido.status,
      forma_pagamento: pedido.forma_pagamento,
      total: pedido.total,
      observacoes: pedido.observacoes,
      ...campos
    })
  });
}

async function mudarStatus(id) {
  const pedido = todosPedidos.find(p => p.id === id);
  const novoStatus = proximoStatus[pedido.status];

  if (!novoStatus) {
    alert('Este pedido já está no status final.');
    return;
  }

  await salvarPedido(pedido, { status: novoStatus });
  carregarPedidos();
}

async function cancelarPedido(id) {
  const pedido = todosPedidos.find(p => p.id === id);
  if (!confirm(`Cancelar o pedido #${id}?`)) return;

  await salvarPedido(pedido, { status: 'cancelado' });
  carregarPedidos();
}

// Edicao simples: dados do cliente + forma de pagamento + observacoes do
// pedido. Editar os itens do pedido em si fica para uma tela dedicada futura.
async function editarPedido(id) {
  const pedido = todosPedidos.find(p => p.id === id);
  const cliente = clientesMap[pedido.cliente_id] || {};

  const nome = prompt('Nome do cliente:', cliente.nome || '');
  if (nome === null) return;
  const telefone = prompt('Telefone:', cliente.telefone || '');
  if (telefone === null) return;
  const endereco = prompt('Endereço:', cliente.endereco || '');
  if (endereco === null) return;
  const observacoes = prompt('Observações:', pedido.observacoes || '');
  if (observacoes === null) return;

  if (pedido.cliente_id) {
    await fetch('http://localhost:3000/clientes/' + pedido.cliente_id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ nome, telefone, endereco })
    });
  }

  await salvarPedido(pedido, { observacoes });

  await carregarClientesMap();
  carregarPedidos();
}

document.querySelectorAll('.aba-btn').forEach(btn => {
  if (btn.dataset.status === abaAtual) btn.classList.add('aba-ativa');
  btn.addEventListener('click', () => {
    abaAtual = btn.dataset.status;
    document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('aba-ativa'));
    btn.classList.add('aba-ativa');
    renderizarPedidos();
  });
});

Promise.all([carregarClientesMap(), carregarProdutosMap(), carregarItensPorPedido()]).then(carregarPedidos);

const socket = io('http://localhost:3000');
socket.on('novo-pedido', async (pedido) => {
  await Promise.all([carregarClientesMap(), carregarProdutosMap(), carregarItensPorPedido()]);
  todosPedidos.push(pedido);
  renderizarPedidos();
});
