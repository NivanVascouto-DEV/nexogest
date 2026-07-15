const ICONE_OBSERVACAO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l5 5v13H6z"/><path d="M15 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>';

const token = localStorage.getItem('token');
let todosPedidos = [];
let clientesMap = {};
let produtosMap = {};
let produtosLista = [];
let itensPorPedido = {};
let abaAtual = 'pendente';
let edicaoAtual = null;
let pedidoHoverId = null;
let pedidoFocoClicado = null;

const proximoStatus = {
  pendente: 'preparando',
  preparando: 'saiu_para_entrega',
  saiu_para_entrega: 'entregue'
};

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function capitalizar(texto) {
  if (!texto) return '-';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

async function carregarClientesMap() {
  const resposta = await fetch('http://localhost:3000/clientes?todos=1', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const clientes = await resposta.json();
  clientesMap = {};
  clientes.forEach(c => { clientesMap[c.id] = c; });
}

async function carregarProdutosMap() {
  const resposta = await fetch('http://localhost:3000/produtos?todos=1', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const produtos = await resposta.json();
  produtosLista = produtos;
  produtosMap = {};
  produtos.forEach(p => { produtosMap[p.id] = { nome: p.nome, preco: parseFloat(p.preco) }; });
}

async function carregarItensPorPedido() {
  const resposta = await fetch('http://localhost:3000/itens-pedido', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const itens = await resposta.json();
  itensPorPedido = {};
  itens.forEach(item => {
    if (!itensPorPedido[item.pedido_id]) itensPorPedido[item.pedido_id] = [];
    itensPorPedido[item.pedido_id].push(item);
  });
}

function nomeProduto(produtoId) {
  const p = produtosMap[produtoId];
  return p ? p.nome : 'Produto';
}

function resumoItens(pedidoId) {
  const itens = itensPorPedido[pedidoId] || [];
  if (itens.length === 0) return 'Sem itens registrados';
  return itens.map(item => `${parseFloat(item.quantidade)}x ${nomeProduto(item.produto_id)}`).join(', ');
}

function carregarPedidos() {
  fetch('http://localhost:3000/pedidos', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(pedidos => {
      todosPedidos = pedidos;
      renderizarPedidos();
    });
}

function renderizarStats() {
  const container = document.getElementById('statsPedidos');
  const contagem = {
    pendente: todosPedidos.filter(p => p.status === 'pendente').length,
    preparando: todosPedidos.filter(p => p.status === 'preparando').length,
    saiu_para_entrega: todosPedidos.filter(p => p.status === 'saiu_para_entrega').length
  };
  container.innerHTML = `
    <div class="stat-card"><p class="stat-numero">${contagem.pendente}</p><p class="stat-rotulo">Pendentes</p></div>
    <div class="stat-card"><p class="stat-numero">${contagem.preparando}</p><p class="stat-rotulo">Preparo</p></div>
    <div class="stat-card"><p class="stat-numero">${contagem.saiu_para_entrega}</p><p class="stat-rotulo">Prontos</p></div>
  `;
}

function atualizarContadoresAbas() {
  document.querySelectorAll('.aba-contador').forEach((span) => {
    const status = span.dataset.contador;
    span.textContent = todosPedidos.filter((p) => p.status === status).length;
  });
}

function renderizarPedidos() {
  renderizarStats();
  atualizarContadoresAbas();

  const container = document.getElementById('listaPedidos');
  container.innerHTML = '';
  edicaoAtual = null;

  const filtrados = todosPedidos.filter(p => p.status === abaAtual);

  if (filtrados.length === 0) {
    container.innerHTML = '<p>Nenhum pedido nesta aba.</p>';
    return;
  }

  filtrados.forEach(pedido => {
    const cliente = clientesMap[pedido.cliente_id];
    const nomeCliente = cliente ? cliente.nome : 'Cliente não identificado';
    const div = document.createElement('div');
    div.className = 'pedido-card';
    div.dataset.pedidoId = pedido.id;
    div.innerHTML = `
      <div class="pedido-item-topo">
        <div>
          <span class="pedido-tipo">${capitalizar(pedido.canal_venda)}</span><span class="pedido-numero">Pedido #${pedido.id}</span>
          <div class="pedido-nome">${nomeCliente}</div>
          <div class="pedido-itens-resumo">${resumoItens(pedido.id)}</div>
        </div>
        <div class="pedido-total">R$ ${pedido.total}</div>
      </div>
      ${pedido.observacoes && pedido.observacoes.trim() ? `
      <div class="observacao-pedido">
        ${ICONE_OBSERVACAO}
        <span>${pedido.observacoes}</span>
      </div>` : ''}
      <div class="pedido-item-acoes">
        <button data-id="${pedido.id}" class="botao-acao btn-avancar">Avançar</button>
        <button data-id="${pedido.id}" class="botao-acao btn-editar">Editar</button>
        <button data-id="${pedido.id}" class="botao-acao btn-imprimir-cozinha">Imprimir cozinha</button>
        <button data-id="${pedido.id}" class="botao-acao btn-imprimir-cliente">Imprimir cliente</button>
        <button data-id="${pedido.id}" class="botao-acao btn-cancelar">Cancelar</button>
      </div>
      <div class="pedido-edicao" style="display:none"></div>
    `;
    div.addEventListener('mouseenter', () => { pedidoHoverId = pedido.id; });
    div.addEventListener('mouseleave', () => { if (pedidoHoverId === pedido.id) pedidoHoverId = null; });
    div.addEventListener('click', () => { pedidoFocoClicado = pedido.id; });

    container.appendChild(div);
  });

  document.querySelectorAll('.btn-avancar').forEach(btn => {
    btn.addEventListener('click', () => mudarStatus(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => abrirEdicaoPedido(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', () => cancelarPedido(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.btn-imprimir-cozinha').forEach(btn => {
    btn.addEventListener('click', () => imprimir(parseInt(btn.dataset.id), 'estabelecimento', btn));
  });

  document.querySelectorAll('.btn-imprimir-cliente').forEach(btn => {
    btn.addEventListener('click', () => imprimir(parseInt(btn.dataset.id), 'cliente', btn));
  });
}

async function imprimir(pedidoId, tipo, btn) {
  const largura = localStorage.getItem('config_largura') || '80';
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Imprimindo...';

  try {
    const resposta = await fetch(`http://localhost:3000/pedidos/${pedidoId}/imprimir/${tipo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ largura: parseInt(largura) })
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      alert(dados.mensagem || 'Não foi possível imprimir. Verifique a impressora.');
    }
  } catch (erro) {
    alert('Não foi possível imprimir. Verifique a conexão com o servidor.');
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
}

async function salvarPedido(pedido, campos) {
  await fetch('http://localhost:3000/pedidos/' + pedido.id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      cliente_id: pedido.cliente_id,
      usuario_id: pedido.usuario_id,
      canal_venda: pedido.canal_venda,
      status: pedido.status,
      forma_pagamento: pedido.forma_pagamento,
      total: pedido.total,
      observacoes: pedido.observacoes,
      ...campos
    })
  });
}

async function mudarStatus(id) {
  const pedido = todosPedidos.find(p => p.id === id);
  const novoStatus = proximoStatus[pedido.status];

  if (!novoStatus) {
    alert('Este pedido já está no status final.');
    return;
  }

  await salvarPedido(pedido, { status: novoStatus });
  carregarPedidos();
}

async function cancelarPedido(id) {
  const pedido = todosPedidos.find(p => p.id === id);
  if (!confirm(`Cancelar o pedido #${id}?`)) return;

  await salvarPedido(pedido, { status: 'cancelado' });
  carregarPedidos();
}

// ---- Edicao inline do pedido (cliente, forma de pagamento, total, itens) ----

function opcoesProdutos(selecionadoId) {
  return produtosLista
    .filter(p => p.ativo !== false)
    .map(p => `<option value="${p.id}"${p.id === selecionadoId ? ' selected' : ''}>${p.nome} — R$ ${p.preco}</option>`).join('');
}

function renderPainelEdicao(pedido) {
  const itens = edicaoAtual.itens;
  const valores = edicaoAtual.valores;
  const itensHtml = itens.length === 0
    ? '<p class="ts-small">Nenhum item.</p>'
    : itens.map((item, indice) => `
      <div class="item-adicionado">
        <span>${item.quantidade}x ${item.nome} — R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        <button type="button" class="btn-remover-item-edicao" data-indice="${indice}">✕</button>
      </div>
    `).join('');

  return `
    <div class="secao-form" style="margin: 0 14px 12px;">
      <h3>Editar pedido #${pedido.id}</h3>

      <label>Nome do cliente</label>
      <input type="text" class="edit-nome" value="${valores.nome || ''}">
      <label>Telefone</label>
      <input type="text" class="edit-telefone" value="${valores.telefone || ''}">
      <label>Endereço</label>
      <input type="text" class="edit-endereco" value="${valores.endereco || ''}">

      <label>Forma de pagamento</label>
      <select class="edit-forma-pagamento">
        <option value="dinheiro"${valores.forma_pagamento === 'dinheiro' ? ' selected' : ''}>Dinheiro</option>
        <option value="pix"${valores.forma_pagamento === 'pix' ? ' selected' : ''}>Pix</option>
        <option value="cartao"${valores.forma_pagamento === 'cartao' ? ' selected' : ''}>Cartão</option>
      </select>

      <label>Observações</label>
      <textarea class="edit-observacoes">${valores.observacoes || ''}</textarea>

      <label>Itens do pedido</label>
      <div class="edit-itens-lista">${itensHtml}</div>
      <div class="linha-adicionar-item">
        <select class="edit-select-produto">${opcoesProdutos()}</select>
        <input type="number" class="edit-qtd-item" value="1" min="1">
        <button type="button" class="edit-btn-add-item">+ Adicionar</button>
      </div>

      <label>Total (editável manualmente, ex: para aplicar desconto)</label>
      <input type="number" class="edit-total" step="0.01" value="${valores.total}">

      <div style="display:flex; gap:8px;">
        <button type="button" class="edit-btn-salvar">Salvar</button>
        <button type="button" class="edit-btn-cancelar" style="background-color: var(--cor-texto-4);">Cancelar</button>
      </div>
    </div>
  `;
}

function capturarValoresPainel(painel) {
  return {
    nome: painel.querySelector('.edit-nome').value,
    telefone: painel.querySelector('.edit-telefone').value,
    endereco: painel.querySelector('.edit-endereco').value,
    forma_pagamento: painel.querySelector('.edit-forma-pagamento').value,
    observacoes: painel.querySelector('.edit-observacoes').value,
    total: painel.querySelector('.edit-total').value
  };
}

function fecharPaineisEdicao() {
  document.querySelectorAll('.pedido-edicao').forEach(painel => {
    painel.style.display = 'none';
    painel.innerHTML = '';
  });
  edicaoAtual = null;
}

function abrirEdicaoPedido(id) {
  const jaAberto = edicaoAtual && edicaoAtual.pedidoId === id;
  fecharPaineisEdicao();
  if (jaAberto) return;

  const pedido = todosPedidos.find(p => p.id === id);
  const cliente = clientesMap[pedido.cliente_id] || {};
  const itensAtuais = (itensPorPedido[id] || []).map(item => ({
    produto_id: item.produto_id,
    nome: nomeProduto(item.produto_id),
    preco: parseFloat(item.preco_unitario),
    quantidade: parseFloat(item.quantidade)
  }));

  edicaoAtual = {
    pedidoId: id,
    itens: itensAtuais,
    valores: {
      nome: cliente.nome || '',
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || '',
      forma_pagamento: pedido.forma_pagamento || '',
      observacoes: pedido.observacoes || '',
      total: pedido.total
    }
  };

  const card = document.querySelector(`.pedido-card[data-pedido-id="${id}"]`);
  const painel = card.querySelector('.pedido-edicao');
  painel.innerHTML = renderPainelEdicao(pedido);
  painel.style.display = 'block';

  wirePainelEdicao(card, pedido);
}

function wirePainelEdicao(card, pedido) {
  const painel = card.querySelector('.pedido-edicao');

  painel.querySelector('.edit-btn-add-item').addEventListener('click', () => {
    const select = painel.querySelector('.edit-select-produto');
    const produtoId = parseInt(select.value);
    const quantidade = parseInt(painel.querySelector('.edit-qtd-item').value) || 1;
    const produto = produtosMap[produtoId];
    if (!produto) return;

    const existente = edicaoAtual.itens.find(i => i.produto_id === produtoId);
    if (existente) {
      existente.quantidade += quantidade;
    } else {
      edicaoAtual.itens.push({ produto_id: produtoId, nome: produto.nome, preco: produto.preco, quantidade });
    }

    edicaoAtual.valores = capturarValoresPainel(painel);
    painel.innerHTML = renderPainelEdicao(pedido);
    wirePainelEdicao(card, pedido);
  });

  painel.querySelectorAll('.btn-remover-item-edicao').forEach(btn => {
    btn.addEventListener('click', () => {
      const indice = parseInt(btn.dataset.indice);
      edicaoAtual.itens.splice(indice, 1);
      edicaoAtual.valores = capturarValoresPainel(painel);
      painel.innerHTML = renderPainelEdicao(pedido);
      wirePainelEdicao(card, pedido);
    });
  });

  painel.querySelector('.edit-btn-cancelar').addEventListener('click', () => {
    fecharPaineisEdicao();
  });

  painel.querySelector('.edit-btn-salvar').addEventListener('click', async () => {
    const btnSalvar = painel.querySelector('.edit-btn-salvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    const nome = painel.querySelector('.edit-nome').value;
    const telefone = painel.querySelector('.edit-telefone').value;
    const endereco = painel.querySelector('.edit-endereco').value;
    const forma_pagamento = painel.querySelector('.edit-forma-pagamento').value;
    const observacoes = painel.querySelector('.edit-observacoes').value;
    const total = parseFloat(painel.querySelector('.edit-total').value) || 0;

    if (pedido.cliente_id) {
      await fetch('http://localhost:3000/clientes/' + pedido.cliente_id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nome, telefone, endereco })
      });
    }

    await salvarPedido(pedido, { forma_pagamento, observacoes, total });

    const itensExistentes = itensPorPedido[pedido.id] || [];
    for (const item of itensExistentes) {
      await fetch('http://localhost:3000/itens-pedido/' + item.id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    }

    for (const item of edicaoAtual.itens) {
      await fetch('http://localhost:3000/itens-pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          pedido_id: pedido.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco
        })
      });
    }

    await Promise.all([carregarClientesMap(), carregarItensPorPedido()]);
    carregarPedidos();
  });
}

document.querySelectorAll('.aba-btn').forEach(btn => {
  if (btn.dataset.status === abaAtual) btn.classList.add('aba-ativa');
  btn.addEventListener('click', () => {
    abaAtual = btn.dataset.status;
    document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('aba-ativa'));
    btn.classList.add('aba-ativa');
    renderizarPedidos();
  });
});

document.addEventListener('keydown', (e) => {
  const alvo = document.activeElement;
  const editando = alvo && ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName);
  if (editando) return;

  const id = pedidoHoverId || pedidoFocoClicado;
  if (!id) return;

  const tecla = e.key.toLowerCase();

  if (tecla === 'a') {
    mudarStatus(id);
  } else if (tecla === 'c') {
    const btn = document.querySelector(`.btn-imprimir-cozinha[data-id="${id}"]`);
    if (btn) imprimir(id, 'estabelecimento', btn);
  } else if (tecla === 'l') {
    const btn = document.querySelector(`.btn-imprimir-cliente[data-id="${id}"]`);
    if (btn) imprimir(id, 'cliente', btn);
  } else if (tecla === 'x') {
    cancelarPedido(id);
  }
});

Promise.all([carregarClientesMap(), carregarProdutosMap(), carregarItensPorPedido()]).then(carregarPedidos);

const socket = io('http://localhost:3000');
socket.on('novo-pedido', async (pedido) => {
  await Promise.all([carregarClientesMap(), carregarProdutosMap(), carregarItensPorPedido()]);
  todosPedidos.push(pedido);
  renderizarPedidos();
});
