const token = localStorage.getItem('token');

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

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
        div.className = 'linha-simples';
        div.innerHTML = `
          <div class="pedido-item-info">
            <div class="avatar-iniciais">${iniciais(cliente.nome)}</div>
            <p>${cliente.nome} - ${cliente.telefone}${cliente.endereco ? ' - ' + cliente.endereco : ''}</p>
          </div>
          <div>
            <button data-id="${cliente.id}" class="btn-editar-cliente">Editar</button>
            <button data-id="${cliente.id}" class="btn-excluir-cliente">Excluir</button>
          </div>
        `;
        container.appendChild(div);
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