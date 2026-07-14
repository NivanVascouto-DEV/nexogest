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
  const corpo = document.getElementById('corpoHistorico');
  corpo.innerHTML = '';

  if (pedidos.length === 0) {
    corpo.innerHTML = '<tr><td colspan="3">Nenhuma venda encontrada.</td></tr>';
    return;
  }

  pedidos.forEach(pedido => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${pedido.id}</td>
      <td>${formatarData(pedido.data_pedido)}</td>
      <td>R$ ${pedido.total}</td>
    `;
    corpo.appendChild(tr);
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
