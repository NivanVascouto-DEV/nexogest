const token = localStorage.getItem('token');
const LIMITE_ESTOQUE_BAIXO = 10;

fetch('http://localhost:3000/produtos', {
  headers: { 'Authorization': 'Bearer ' + token }
})
  .then(resposta => resposta.json())
  .then(produtos => {
    const container = document.getElementById('listaEstoque');

    const produtosComEstoque = produtos.filter(p => p.controla_estoque);

    if (produtosComEstoque.length === 0) {
      container.innerHTML = '<p>Nenhum produto com controle de estoque.</p>';
      return;
    }

    produtosComEstoque.forEach(produto => {
      const quantidade = parseFloat(produto.quantidade_estoque) || 0;
      const baixo = quantidade <= LIMITE_ESTOQUE_BAIXO;

      const div = document.createElement('div');
      div.className = 'linha-simples';
      div.innerHTML = `
        <p>${produto.nome}</p>
        <span class="badge-estoque ${baixo ? 'badge-baixo' : 'badge-ok'}">${quantidade} ${produto.unidade_venda}</span>
      `;
      container.appendChild(div);
    });
  });