const token = localStorage.getItem('token');
let todosClientes = [];
let contagemPedidosPorCliente = {};

function iniciaisCliente(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function renderizarClientes(clientes) {
  const grade = document.getElementById('gradeClientes');
  grade.innerHTML = '';

  if (clientes.length === 0) {
    grade.innerHTML = '<p class="ts-small">Nenhum cliente encontrado.</p>';
    return;
  }

  clientes.forEach(cliente => {
    const qtdPedidos = contagemPedidosPorCliente[cliente.id] || 0;
    const card = document.createElement('div');
    card.className = 'card-cliente';
    card.innerHTML = `
      <div class="card-cliente-avatar">${iniciaisCliente(cliente.nome)}</div>
      <div class="card-cliente-info">
        <div class="card-cliente-nome">${cliente.nome}</div>
        <div class="card-cliente-telefone">${cliente.telefone || '-'}</div>
      </div>
      <div class="card-cliente-pedidos">
        <div class="card-cliente-pedidos-numero">${qtdPedidos}</div>
        <div class="card-cliente-pedidos-rotulo">pedidos</div>
      </div>
      <div class="acoes-linha card-cliente-acoes">
        <button data-id="${cliente.id}" class="btn-editar-cliente btn-editar-linha">Editar</button>
        <button data-id="${cliente.id}" class="btn-excluir-cliente btn-excluir-linha">Excluir</button>
      </div>
    `;
    grade.appendChild(card);
  });

  document.querySelectorAll('.btn-editar-cliente').forEach(btn => {
    const cliente = clientes.find(c => c.id === parseInt(btn.dataset.id));
    btn.addEventListener('click', () => editarCliente(cliente));
  });

  document.querySelectorAll('.btn-excluir-cliente').forEach(btn => {
    btn.addEventListener('click', () => excluirCliente(parseInt(btn.dataset.id)));
  });
}

function aplicarBuscaCliente() {
  const termo = document.getElementById('buscaCliente').value.trim().toLowerCase();

  if (!termo) {
    renderizarClientes(todosClientes);
    return;
  }

  const filtrados = todosClientes.filter(c =>
    (c.nome && c.nome.toLowerCase().includes(termo)) ||
    (c.telefone && c.telefone.includes(termo))
  );
  renderizarClientes(filtrados);
}

document.getElementById('buscaCliente').addEventListener('input', aplicarBuscaCliente);

function carregarClientes() {
  Promise.all([
    fetch(`${API_URL}/clientes`, { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json()),
    fetch(`${API_URL}/pedidos`, { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json())
  ]).then(([clientes, pedidos]) => {
    todosClientes = clientes;

    contagemPedidosPorCliente = {};
    pedidos.forEach(pedido => {
      contagemPedidosPorCliente[pedido.cliente_id] = (contagemPedidosPorCliente[pedido.cliente_id] || 0) + 1;
    });

    aplicarBuscaCliente();
  });
}

document.getElementById('btnSalvarCliente').addEventListener('click', async () => {
  const nome = document.getElementById('nomeCliente').value;
  const telefone = document.getElementById('telefoneCliente').value;
  const endereco = document.getElementById('enderecoCliente').value;

  if (!nome || !telefone) {
    alert('Informe ao menos nome e telefone.');
    return;
  }

  await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ nome, telefone, endereco })
  });

  document.getElementById('nomeCliente').value = '';
  document.getElementById('telefoneCliente').value = '';
  document.getElementById('enderecoCliente').value = '';

  mostrarToast('Cliente salvo com sucesso!');
  carregarClientes();
});

async function editarCliente(cliente) {
  const nome = prompt('Nome:', cliente.nome);
  if (nome === null) return;
  const telefone = prompt('Telefone:', cliente.telefone);
  if (telefone === null) return;
  const endereco = prompt('Endereço:', cliente.endereco || '');
  if (endereco === null) return;

  await fetch(`${API_URL}/clientes/` + cliente.id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ nome, telefone, endereco })
  });

  mostrarToast('Cliente atualizado com sucesso!');
  carregarClientes();
}

async function excluirCliente(id) {
  await fetch(`${API_URL}/clientes/` + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  carregarClientes();
}

carregarClientes();
