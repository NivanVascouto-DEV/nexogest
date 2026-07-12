const token = localStorage.getItem('token');
let todosPedidos = [];
let abaAtual = 'pendente';

const proximoStatus = {
  pendente: 'preparando',
  preparando: 'saiu_para_entrega',
  saiu_para_entrega: 'entregue'
};

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
    const div = document.createElement('div');
    div.className = 'pedido-item';
    div.innerHTML = `
      <p>Pedido #${pedido.id} - R$ ${pedido.total}</p>
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
  btn.addEventListener('click', () => {
    abaAtual = btn.dataset.status;
    renderizarPedidos();
  });
});

carregarPedidos();