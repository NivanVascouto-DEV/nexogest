const token = localStorage.getItem('token');
const LIMITE_ESTOQUE_BAIXO = 10;
// Não existe um campo de "estoque mínimo/máximo" configurável por produto no
// banco - a barra de progresso usa uma referência relativa ao próprio limite
// de estoque baixo (3x o limite = barra cheia) só para dar uma noção visual
// de nível, sem exigir mudança de schema.
const REFERENCIA_ESTOQUE_CHEIO = LIMITE_ESTOQUE_BAIXO * 3;

function nivelEstoque(quantidade) {
  if (quantidade <= LIMITE_ESTOQUE_BAIXO) {
    return { cor: 'var(--cor-perigo)', bg: 'var(--cor-perigo-fundo)', linha: 'var(--cor-perigo-borda)' };
  }
  if (quantidade <= LIMITE_ESTOQUE_BAIXO * 2) {
    return { cor: 'var(--cor-alerta)', bg: 'var(--cor-alerta-fundo)', linha: 'var(--cor-alerta-borda)' };
  }
  return { cor: 'var(--cor-sucesso)', bg: 'var(--cor-sucesso-fundo)', linha: 'var(--cor-sucesso-borda)' };
}

function carregarEstoque() {
  fetch(`${API_URL}/produtos`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(produtos => {
      const lista = document.getElementById('listaEstoque');
      const aviso = document.getElementById('avisoEstoqueBaixo');
      lista.innerHTML = '';

      const produtosComEstoque = produtos.filter(p => p.controla_estoque);

      if (produtosComEstoque.length === 0) {
        aviso.style.display = 'none';
        lista.innerHTML = '<p class="ts-small">Nenhum produto com controle de estoque.</p>';
        return;
      }

      const produtosBaixos = produtosComEstoque.filter(p => (parseFloat(p.quantidade_estoque) || 0) <= LIMITE_ESTOQUE_BAIXO);

      if (produtosBaixos.length > 0) {
        aviso.style.display = 'flex';
        aviso.innerHTML = `
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9L2.4 17.5A1.8 1.8 0 004 20.2h16a1.8 1.8 0 001.6-2.7L13.7 3.9a1.9 1.9 0 00-3.4 0z"></path></svg>
          <span>${produtosBaixos.length} produto${produtosBaixos.length > 1 ? 's' : ''} abaixo do estoque mínimo</span>
        `;
      } else {
        aviso.style.display = 'none';
      }

      produtosComEstoque.forEach(produto => {
        const quantidade = parseFloat(produto.quantidade_estoque) || 0;
        const nivel = nivelEstoque(quantidade);
        const pct = Math.max(4, Math.min(100, (quantidade / REFERENCIA_ESTOQUE_CHEIO) * 100));

        const item = document.createElement('div');
        item.className = 'item-estoque';
        item.innerHTML = `
          <div class="item-estoque-info">
            <div class="item-estoque-nome">${produto.nome}</div>
            <div class="item-estoque-barra">
              <div class="item-estoque-barra-preenchida" style="width:${pct}%;background:${nivel.cor}"></div>
            </div>
          </div>
          <span class="item-estoque-qtd" style="background:${nivel.bg};border-color:${nivel.linha};color:${nivel.cor}">${quantidade} ${produto.unidade_venda}</span>
          <button data-id="${produto.id}" class="btn-entrada-estoque">+ Entrada</button>
        `;
        lista.appendChild(item);
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

  await fetch(`${API_URL}/produtos/` + produto.id, {
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
