const token = localStorage.getItem('token');

function carregarClientes() {
  fetch('http://localhost:3000/clientes', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(clientes => {
      const corpo = document.getElementById('corpoClientes');
      corpo.innerHTML = '';

      clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${cliente.nome}</td>
          <td>${cliente.telefone}</td>
          <td>
            <div class="acoes-linha">
              <button data-id="${cliente.id}" class="btn-editar-cliente btn-editar-linha">Editar</button>
              <button data-id="${cliente.id}" class="btn-excluir-cliente btn-excluir-linha">Excluir</button>
            </div>
          </td>
        `;
        corpo.appendChild(tr);
      });

      document.querySelectorAll('.btn-editar-cliente').forEach(btn => {
        const cliente = clientes.find(c => c.id === parseInt(btn.dataset.id));
        btn.addEventListener('click', () => editarCliente(cliente));
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

  if (!nome || !telefone) {
    alert('Informe ao menos nome e telefone.');
    return;
  }

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

  await fetch('http://localhost:3000/clientes/' + cliente.id, {
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
  await fetch('http://localhost:3000/clientes/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  carregarClientes();
}

carregarClientes();
