const token = localStorage.getItem('token');

function carregarProdutos() {
  fetch('http://localhost:3000/produtos', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(produtos => {
      const corpo = document.getElementById('corpoProdutos');
      corpo.innerHTML = '';

      produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${produto.codigo}</td>
          <td>${produto.nome}</td>
          <td>${produto.unidade_venda}</td>
          <td>R$ ${produto.preco}</td>
          <td><button data-id="${produto.id}" class="btn-excluir-linha">Excluir</button></td>
        `;
        corpo.appendChild(tr);
      });

      document.querySelectorAll('.btn-excluir-linha').forEach(btn => {
        btn.addEventListener('click', () => excluirProduto(parseInt(btn.dataset.id)));
      });
    });
}

document.getElementById('btnSalvarProduto').addEventListener('click', async () => {
  const nome = document.getElementById('nomeProduto').value;
  const preco = document.getElementById('precoProduto').value;
  const codigo = document.getElementById('codigoProduto').value;
  const canal_venda = document.getElementById('canalVenda').value;
  const unidade_venda = document.getElementById('unidadeVenda').value;
  const controla_estoque = document.getElementById('controlaEstoque').checked;

  await fetch('http://localhost:3000/produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ nome, preco, codigo, canal_venda, unidade_venda, controla_estoque })
  });

  document.getElementById('nomeProduto').value = '';
  document.getElementById('precoProduto').value = '';
  document.getElementById('codigoProduto').value = '';

  carregarProdutos();
});

async function excluirProduto(id) {
  await fetch('http://localhost:3000/produtos/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  carregarProdutos();
}

carregarProdutos();
