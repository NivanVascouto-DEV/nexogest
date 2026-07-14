const token = localStorage.getItem('token');
let todasDespesas = [];

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

function diasAteVencimento(dataISO) {
  if (!dataISO) return null;
  const hoje = new Date();
  const vencimento = new Date(dataISO);
  const diffMs = vencimento.getTime() - Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function renderizarDespesas(despesas) {
  const corpo = document.getElementById('corpoDespesas');
  corpo.innerHTML = '';

  if (despesas.length === 0) {
    corpo.innerHTML = '<tr><td colspan="4">Nenhuma despesa lançada.</td></tr>';
    return;
  }

  despesas.forEach(d => {
    const dias = diasAteVencimento(d.data_vencimento);
    const proximoVencimento = dias !== null && dias <= 7;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.descricao}</td>
      <td>${d.categoria}</td>
      <td>${formatarData(d.data_vencimento)} ${proximoVencimento ? '<span class="badge badge-perigo">Vence em breve</span>' : ''}</td>
      <td>R$ ${d.valor}</td>
    `;
    corpo.appendChild(tr);
  });
}

function carregarDespesas() {
  fetch('http://localhost:3000/lancamentos-financeiros', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(resposta => resposta.json())
    .then(lancamentos => {
      todasDespesas = lancamentos.filter(l => l.tipo === 'saida');
      renderizarDespesas(todasDespesas);
    });
}

document.getElementById('btnFiltrarFin').addEventListener('click', () => {
  const inicio = document.getElementById('dataInicioFin').value;
  const fim = document.getElementById('dataFimFin').value;

  if (!inicio || !fim) {
    renderizarDespesas(todasDespesas);
    return;
  }

  const filtradas = todasDespesas.filter(d => {
    if (!d.data_vencimento) return false;
    const data = d.data_vencimento.split('T')[0].split(' ')[0];
    return data >= inicio && data <= fim;
  });

  renderizarDespesas(filtradas);
});

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
