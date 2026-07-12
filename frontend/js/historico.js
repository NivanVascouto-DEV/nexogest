const token = localStorage.getItem('token');
let todosOsPedidos = [];

function carregarHistorico() {
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
  const container = document.getElementById('listaHistorico');
  container.innerHTML = '';

  if (pedidos.length === 0) {
    container.innerHTML = '<p>Nenhuma venda encontrada.</p>';
    return;
  }

  pedidos.forEach(pedido => {
    const div = document.createElement('div');
    div.className = 'pedido-item';
    div.innerHTML = `
      <p>Pedido #${pedido.id} - R$ ${pedido.total} <span class="ts-small">${formatarData(pedido.data_pedido)}</span></p>
    `;
    container.appendChild(div);
  });
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