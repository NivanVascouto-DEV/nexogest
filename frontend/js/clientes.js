const token = localStorage.getItem('token');

function carregarClientes() {
  fetch('http://localhost:3000/clientes', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(clientes => {
      const container = document.getElementById('listaClientes');
      container.innerHTML = '';

      clientes.forEach(cliente => {
        const div = document.createElement('div');
        div.className = 'pedido-item';
        div.innerHTML = `
          <p>${cliente.nome} - ${cliente.telefone}</p>
          <button data-id="${cliente.id}" class="btn-excluir-cliente">Excluir</button>
        `;
        container.appendChild(div);
      });

      document.querySelectorAll('.btn-excluir-cliente').forEach(btn => {
        btn.addEventListener('click', () => excluirCliente(parseInt(btn.dataset.id)));
      });
    });
}

document.getElementById('btnSalvarCliente').addEventListener('click', async () => {
  const nome = document.getElementById('nomeCliente').value;
  const telefone = document.getElementById('telefoneCliente').value;
  const endereco = document.getElementById('enderecoCliente').value;

  await fetch('http://localhost:3000/clientes', {
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

  carregarClientes();
});

async function excluirCliente(id) {
  await fetch('http://localhost:3000/clientes/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  carregarClientes();
}

carregarClientes();