const token = localStorage.getItem('token');

function carregarDRE() {
  fetch('http://localhost:3000/relatorios/dre', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(dre => {
      const container = document.getElementById('metricasDRE');
      container.innerHTML = `
        <div class="metrica-card">
          <p class="metrica-label">Lucro bruto</p>
          <p class="metrica-valor">R$ ${dre.lucro_bruto.toFixed(2)}</p>
        </div>
        <div class="metrica-card">
          <p class="metrica-label">Lucro líquido</p>
          <p class="metrica-valor">R$ ${dre.lucro_liquido.toFixed(2)}</p>
        </div>
      `;
    });
}

function carregarPagamentos() {
  fetch('http://localhost:3000/relatorios/pagamentos', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(pagamentos => {
      const totais = { dinheiro: 0, pix: 0, cartao: 0 };
      pagamentos.forEach(p => { totais[p.forma_pagamento] = parseFloat(p.total); });

      const container = document.getElementById('metricasPagamento');
      container.innerHTML = `
        <div class="metrica-card"><p class="metrica-label">Dinheiro</p><p class="metrica-valor">R$ ${totais.dinheiro.toFixed(2)}</p></div>
        <div class="metrica-card"><p class="metrica-label">Cartão</p><p class="metrica-valor">R$ ${totais.cartao.toFixed(2)}</p></div>
        <div class="metrica-card"><p class="metrica-label">Pix</p><p class="metrica-valor">R$ ${totais.pix.toFixed(2)}</p></div>
      `;
    });
}

function formatarData(dataISO) {
  if (!dataISO) return '-';
  const data = new Date(dataISO);
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const ano = data.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

function carregarDespesas() {
  fetch('http://localhost:3000/lancamentos-financeiros', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(lancamentos => {
      const despesas = lancamentos.filter(l => l.tipo === 'saida');
      const container = document.getElementById('listaDespesas');
      container.innerHTML = '';

      despesas.forEach(d => {
        const div = document.createElement('div');
        div.className = 'despesa-linha';
        div.innerHTML = `
          <div>
            <div style="font-size:12.5px; font-weight:500;">${d.descricao}</div>
            <div class="ts-small">${d.categoria} · vence em ${formatarData(d.data_vencimento)}</div>
          </div>
          <div class="despesa-valor">R$ ${d.valor}</div>
        `;
        container.appendChild(div);
      });
    });
}

document.getElementById('btnSalvarDespesa').addEventListener('click', async () => {
  const descricao = document.getElementById('descricaoDespesa').value;
  const categoria = document.getElementById('categoriaDespesa').value;
  const valor = document.getElementById('valorDespesa').value;
  const forma_pagamento = document.getElementById('formaPagamentoDespesa').value;
  const data_vencimento = document.getElementById('vencimentoDespesa').value;

  await fetch('http://localhost:3000/lancamentos-financeiros', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ tipo: 'saida', categoria, descricao, valor, forma_pagamento, data_vencimento })
  });

  document.getElementById('descricaoDespesa').value = '';
  document.getElementById('valorDespesa').value = '';
  document.getElementById('vencimentoDespesa').value = '';

  carregarDespesas();
});

carregarDRE();
carregarPagamentos();
carregarDespesas();