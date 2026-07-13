const token = localStorage.getItem('token');
let pedidoAtual = [];

fetch('http://localhost:3000/produtos', {
  headers: { 'Authorization': 'Bearer ' + token }
})
  .then(resposta => resposta.json())
  .then(produtos => {
    const container = document.getElementById('listaProdutos');
    produtos.forEach(produto => {
      const card = document.createElement('div');
      card.className = 'produto-card';
      card.innerHTML = `
        <div class="produto-imagem"></div>
        <p class="produto-nome">${produto.nome}</p>
        <p class="produto-preco">R$ ${produto.preco}</p>
      `;
      card.addEventListener('click', () => adicionarAoPedido(produto));
      container.appendChild(card);
    });
  });

function adicionarAoPedido(produto) {
  pedidoAtual.push(produto);
  atualizarTotal();
}

function atualizarTotal() {
  const total = pedidoAtual.reduce((soma, item) => soma + parseFloat(item.preco), 0);
  document.getElementById('totalPedido').textContent = 'R$ ' + total.toFixed(2);
  atualizarTroco();
}

function atualizarTroco() {
  const total = pedidoAtual.reduce((soma, item) => soma + parseFloat(item.preco), 0);
  const valorRecebido = parseFloat(document.getElementById('valorRecebido').value);
  const resultado = document.getElementById('resultadoTroco');

  if (isNaN(valorRecebido)) {
    resultado.textContent = '';
    resultado.className = 'troco-resultado';
    return;
  }

  const diferenca = valorRecebido - total;
  if (diferenca < 0) {
    resultado.textContent = `Falta R$ ${Math.abs(diferenca).toFixed(2)}`;
    resultado.className = 'troco-resultado troco-faltando';
  } else {
    resultado.textContent = `Troco: R$ ${diferenca.toFixed(2)}`;
    resultado.className = 'troco-resultado troco-ok';
  }
}

document.getElementById('valorRecebido').addEventListener('input', atualizarTroco);

async function buscarOuCriarCliente(nome, telefone, endereco) {
  const resposta = await fetch('http://localhost:3000/clientes', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const clientes = await resposta.json();

  const clienteExistente = clientes.find(c => c.telefone === telefone);

  if (clienteExistente) {
    return clienteExistente.id;
  }

  const respostaNovoCliente = await fetch('http://localhost:3000/clientes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ nome: nome || 'Cliente', telefone: telefone, endereco: endereco })
  });

  const novoCliente = await respostaNovoCliente.json();
  return novoCliente.id;
}

document.getElementById('btnFinalizar').addEventListener('click', async () => {
  const total = pedidoAtual.reduce((soma, item) => soma + parseFloat(item.preco), 0);
  const nome = document.getElementById('nomeCliente').value;
  const telefone = document.getElementById('telefoneCliente').value;
  const endereco = document.getElementById('enderecoCliente').value;
  const observacoes = document.getElementById('observacoesPedido').value;
  const clienteId = await buscarOuCriarCliente(nome, telefone, endereco);

  const respostaPedido = await fetch('http://localhost:3000/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      cliente_id: clienteId,
      usuario_id: parseInt(localStorage.getItem('id')),
      canal_venda: 'convencional',
      status: 'pendente',
      forma_pagamento: 'pix',
      total: total,
      observacoes: observacoes
    })
  });

  const pedidoCriado = await respostaPedido.json();

  for (const item of pedidoAtual) {
    await fetch('http://localhost:3000/itens-pedido', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        pedido_id: pedidoCriado.id,
        produto_id: item.id,
        quantidade: 1,
        preco_unitario: item.preco
      })
    });
  }

  alert('Pedido finalizado com sucesso!');
  pedidoAtual = [];
  document.getElementById('nomeCliente').value = '';
  document.getElementById('telefoneCliente').value = '';
  document.getElementById('enderecoCliente').value = '';
  document.getElementById('observacoesPedido').value = '';
  document.getElementById('valorRecebido').value = '';
  atualizarTotal();
});