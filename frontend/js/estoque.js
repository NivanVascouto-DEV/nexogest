const token = localStorage.getItem('token');
const LIMITE_ESTOQUE_BAIXO = 10;

function carregarEstoque() {
  fetch('http://localhost:3000/produtos', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(produtos => {
      const corpo = document.getElementById('corpoEstoque');
      corpo.innerHTML = '';

      const produtosComEstoque = produtos.filter(p => p.controla_estoque);

      if (produtosComEstoque.length === 0) {
        corpo.innerHTML = '<tr><td colspan="3">Nenhum produto com controle de estoque.</td></tr>';
        return;
      }

      produtosComEstoque.forEach(produto => {
        const quantidade = parseFloat(produto.quantidade_estoque) || 0;
        const baixo = quantidade <= LIMITE_ESTOQUE_BAIXO;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${produto.nome}</td>
          <td><span class="badge ${baixo ? 'badge-perigo' : 'badge-ok'}">${quantidade} ${produto.unidade_venda}</span></td>
          <td><button data-id="${produto.id}" class="btn-entrada-estoque btn-editar-linha">+ Entrada</button></td>
        `;
        corpo.appendChild(tr);
      });

      document.querySelectorAll('.btn-entrada-estoque').forEach(btn => {
        const produto = produtos.find(p => p.id === parseInt(btn.dataset.id));
        btn.addEventListener('click', () => registrarEntrada(produto));
      });
    });
}

async function registrarEntrada(produto) {
  const quantidadeTexto = prompt(`Quantidade a adicionar ao estoque de "${produto.nome}":`, '');
  if (quantidadeTexto === null) return;

  const quantidadeAdicionar = parseFloat(quantidadeTexto);
  if (isNaN(quantidadeAdicionar) || quantidadeAdicionar <= 0) {
    alert('Informe uma quantidade válida maior que zero.');
    return;
  }

  const quantidadeAtual = parseFloat(produto.quantidade_estoque) || 0;
  const novaQuantidade = quantidadeAtual + quantidadeAdicionar;

  await fetch('http://localhost:3000/produtos/' + produto.id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      nome: produto.nome,
      preco: produto.preco,
      codigo: produto.codigo,
      canal_venda: produto.canal_venda,
      unidade_venda: produto.unidade_venda,
      controla_estoque: produto.controla_estoque,
      quantidade_estoque: novaQuantidade,
      imagem: produto.imagem
    })
  });

  mostrarToast('Estoque atualizado com sucesso!');
  carregarEstoque();
}

carregarEstoque();
