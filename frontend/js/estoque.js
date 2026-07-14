const token = localStorage.getItem('token');
const LIMITE_ESTOQUE_BAIXO = 10;

fetch('http://localhost:3000/produtos', {
  headers: { 'Authorization': 'Bearer ' + token }
})
  .then(resposta => resposta.json())
  .then(produtos => {
    const corpo = document.getElementById('corpoEstoque');

    const produtosComEstoque = produtos.filter(p => p.controla_estoque);

    if (produtosComEstoque.length === 0) {
      corpo.innerHTML = '<tr><td colspan="2">Nenhum produto com controle de estoque.</td></tr>';
      return;
    }

    produtosComEstoque.forEach(produto => {
      const quantidade = parseFloat(produto.quantidade_estoque) || 0;
      const baixo = quantidade <= LIMITE_ESTOQUE_BAIXO;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${produto.nome}</td>
        <td><span class="badge ${baixo ? 'badge-perigo' : 'badge-ok'}">${quantidade} ${produto.unidade_venda}</span></td>
      `;
      corpo.appendChild(tr);
    });
  });
