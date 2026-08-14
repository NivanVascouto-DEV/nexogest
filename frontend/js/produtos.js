const token = localStorage.getItem('token');
let todosProdutos = [];

function renderizarProdutos(produtos) {
  const corpo = document.getElementById('corpoProdutos');
  corpo.innerHTML = '';

  if (produtos.length === 0) {
    corpo.innerHTML = '<tr><td colspan="5">Nenhum produto encontrado.</td></tr>';
    return;
  }

  produtos.forEach(produto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${produto.codigo}</td>
      <td>${produto.nome}</td>
      <td>${produto.unidade_venda}</td>
      <td>R$ ${produto.preco}</td>
      <td>
        <div class="acoes-linha">
          <button data-id="${produto.id}" class="btn-editar-produto btn-editar-linha">Editar</button>
          <button data-id="${produto.id}" class="btn-excluir-produto btn-excluir-linha">Excluir</button>
        </div>
      </td>
    `;
    corpo.appendChild(tr);
  });

  document.querySelectorAll('.btn-editar-produto').forEach(btn => {
    const produto = produtos.find(p => p.id === parseInt(btn.dataset.id));
    btn.addEventListener('click', () => editarProduto(produto));
  });

  document.querySelectorAll('.btn-excluir-produto').forEach(btn => {
    btn.addEventListener('click', () => excluirProduto(parseInt(btn.dataset.id)));
  });
}

function aplicarBuscaProduto() {
  const termo = document.getElementById('buscaProduto').value.trim().toLowerCase();

  if (!termo) {
    renderizarProdutos(todosProdutos);
    return;
  }

  const filtrados = todosProdutos.filter(p =>
    (p.nome && p.nome.toLowerCase().includes(termo)) ||
    String(p.codigo).toLowerCase().includes(termo)
  );
  renderizarProdutos(filtrados);
}

document.getElementById('buscaProduto').addEventListener('input', aplicarBuscaProduto);

function carregarProdutos() {
  fetch(`${API_URL}/produtos`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(produtos => {
      todosProdutos = produtos;
      aplicarBuscaProduto();
    });
}

document.getElementById('btnSalvarProduto').addEventListener('click', async () => {
  const nome = document.getElementById('nomeProduto').value;
  const preco = document.getElementById('precoProduto').value;
  const codigo = document.getElementById('codigoProduto').value;
  const canal_venda = document.getElementById('canalVenda').value;
  const unidade_venda = document.getElementById('unidadeVenda').value;
  const controla_estoque = document.getElementById('controlaEstoque').checked;

  await fetch(`${API_URL}/produtos`, {
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

  mostrarToast('Produto salvo com sucesso!');
  carregarProdutos();
});

async function editarProduto(produto) {
  const nome = prompt('Nome:', produto.nome);
  if (nome === null) return;
  const preco = prompt('Preço:', produto.preco);
  if (preco === null) return;
  const codigo = prompt('Código:', produto.codigo);
  if (codigo === null) return;
  const canal_venda = prompt('Canal de venda (convencional/delivery):', produto.canal_venda || '');
  if (canal_venda === null) return;
  const unidade_venda = prompt('Unidade (unidade/kg/pacote):', produto.unidade_venda || '');
  if (unidade_venda === null) return;
  const controlaEstoqueTexto = prompt('Controla estoque? (sim/nao):', produto.controla_estoque ? 'sim' : 'nao');
  if (controlaEstoqueTexto === null) return;

  await fetch(`${API_URL}/produtos/` + produto.id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      nome,
      preco,
      codigo,
      canal_venda,
      unidade_venda,
      controla_estoque: controlaEstoqueTexto.trim().toLowerCase() === 'sim',
      quantidade_estoque: produto.quantidade_estoque,
      imagem: produto.imagem
    })
  });

  mostrarToast('Produto atualizado com sucesso!');
  carregarProdutos();
}

async function excluirProduto(id) {
  await fetch(`${API_URL}/produtos/` + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  carregarProdutos();
}

carregarProdutos();
