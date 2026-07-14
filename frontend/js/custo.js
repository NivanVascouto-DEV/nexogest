const token = localStorage.getItem('token');

async function carregarSelects() {
  const respostaProdutos = await fetch('http://localhost:3000/produtos', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const produtos = await respostaProdutos.json();

  const selectProduto = document.getElementById('selectProduto');
  produtos.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.nome;
    selectProduto.appendChild(option);
  });

  const respostaInsumos = await fetch('http://localhost:3000/insumos', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const insumos = await respostaInsumos.json();

  const selectInsumo = document.getElementById('selectInsumo');
  selectInsumo.innerHTML = '';
  insumos.forEach(i => {
    const option = document.createElement('option');
    option.value = i.id;
    option.textContent = i.nome;
    selectInsumo.appendChild(option);
  });

  selectProduto.addEventListener('change', calcularCusto);
  if (produtos.length > 0) calcularCusto();
}

document.getElementById('btnSalvarInsumo').addEventListener('click', async () => {
  const nome = document.getElementById('nomeInsumo').value;
  const unidade_medida = document.getElementById('unidadeInsumo').value;
  const custo_por_unidade = document.getElementById('custoInsumo').value;

  await fetch('http://localhost:3000/insumos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ nome, unidade_medida, custo_por_unidade })
  });

  document.getElementById('nomeInsumo').value = '';
  document.getElementById('custoInsumo').value = '';

  carregarSelects();
});

document.getElementById('btnSalvarFicha').addEventListener('click', async () => {
  const produto_id = document.getElementById('selectProduto').value;
  const insumo_id = document.getElementById('selectInsumo').value;
  const quantidade_usada = document.getElementById('quantidadeUsada').value;

  await fetch('http://localhost:3000/ficha-tecnica', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ produto_id, insumo_id, quantidade_usada })
  });

  document.getElementById('quantidadeUsada').value = '';

  calcularCusto();
});

async function calcularCusto() {
  const produtoId = document.getElementById('selectProduto').value;
  if (!produtoId) return;

  const respostaFicha = await fetch(`http://localhost:3000/ficha-tecnica/produto/${produtoId}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const itensFicha = await respostaFicha.json();

  const corpo = document.getElementById('corpoFichaTecnica');
  corpo.innerHTML = '';

  if (itensFicha.length === 0) {
    corpo.innerHTML = '<tr><td colspan="4">Nenhum insumo cadastrado para este produto.</td></tr>';
  } else {
    itensFicha.forEach(item => {
      const subtotal = parseFloat(item.quantidade_usada) * parseFloat(item.custo_por_unidade);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.quantidade_usada} ${item.unidade_medida}</td>
        <td>R$ ${parseFloat(item.custo_por_unidade).toFixed(2)}</td>
        <td>R$ ${subtotal.toFixed(2)}</td>
      `;
      corpo.appendChild(tr);
    });
  }

  const resposta = await fetch(`http://localhost:3000/produtos/${produtoId}/custo`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const dados = await resposta.json();

  const custo = parseFloat(dados.custo_producao) || 0;
  document.getElementById('resultadoCusto').innerHTML = `
    <p class="metrica-label">Custo de produção deste produto</p>
    <p class="metrica-valor">R$ ${custo.toFixed(2)}</p>
  `;
}

carregarSelects();
