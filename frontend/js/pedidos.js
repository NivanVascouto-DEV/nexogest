const token = localStorage.getItem('token');
let todosPedidos = [];
let clientesMap = {};
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

async function carregarClientesMap() {
  const resposta = await fetch('http://localhost:3000/clientes', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const clientes = await resposta.json();
  clientesMap = {};
  clientes.forEach(c => { clientesMap[c.id] = c.nome; });
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

function renderizarPedidos() {
  const container = document.getElementById('listaPedidos');
  container.innerHTML = '';

  const filtrados = todosPedidos.filter(p => p.status === abaAtual);

  if (filtrados.length === 0) {
    container.innerHTML = '<p>Nenhum pedido nesta aba.</p>';
    return;
  }

  filtrados.forEach(pedido => {
    const nomeCliente = clientesMap[pedido.cliente_id] || '';
    const div = document.createElement('div');
    div.className = 'pedido-item';
    div.innerHTML = `
      <div class="pedido-item-info">
        <div class="avatar-iniciais">${iniciais(nomeCliente)}</div>
        <p>Pedido #${pedido.id} - R$ ${pedido.total}${nomeCliente ? ' - ' + nomeCliente : ''}</p>
      </div>
      <button data-id="${pedido.id}" class="btn-avancar">Avançar status</button>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll('.btn-avancar').forEach(btn => {
    btn.addEventListener('click', () => mudarStatus(parseInt(btn.dataset.id)));
  });
}

async function mudarStatus(id) {
  const pedido = todosPedidos.find(p => p.id === id);
  const novoStatus = proximoStatus[pedido.status];

  if (!novoStatus) {
    alert('Este pedido já está no status final.');
    return;
  }

  await fetch('http://localhost:3000/pedidos/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      cliente_id: pedido.cliente_id,
      usuario_id: pedido.usuario_id,
      canal_venda: pedido.canal_venda,
      status: novoStatus,
      forma_pagamento: pedido.forma_pagamento,
      total: pedido.total,
      observacoes: pedido.observacoes
    })
  });

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

carregarClientesMap().then(renderizarPedidos);
carregarPedidos();

const socket = io('http://localhost:3000');
socket.on('novo-pedido', async (pedido) => {
  await carregarClientesMap();
  todosPedidos.push(pedido);
  renderizarPedidos();
});