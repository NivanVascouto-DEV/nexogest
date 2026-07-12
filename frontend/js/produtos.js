const token = localStorage.getItem('token');

function carregarProdutos() {
  fetch('http://localhost:3000/produtos', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(produtos => {
      const container = document.getElementById('listaProdutosGrid');
      container.innerHTML = '';

      produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
          <div class="produto-imagem"></div>
          <p class="produto-nome">${produto.nome}</p>
          <p class="produto-preco">R$ ${produto.preco}</p>
          <p class="produto-codigo">Código: ${produto.codigo}</p>
          <button data-id="${produto.id}" class="btn-excluir">Excluir</button>
        `;
        container.appendChild(card);
      });

      document.querySelectorAll('.btn-excluir').forEach(btn => {
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