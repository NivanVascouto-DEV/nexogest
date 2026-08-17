let temaSelecionado = 'claro';
let corSelecionada = '#D4537E';

function aplicarTemaVisual(tema) {
  document.querySelectorAll('#segmentadoTema .segmentado-btn').forEach(btn => {
    btn.classList.toggle('segmentado-ativo', btn.dataset.tema === tema);
  });
  document.body.classList.toggle('dark-mode', tema === 'escuro');
}

function aplicarCorVisual(cor) {
  document.querySelectorAll('#paletaCores .swatch').forEach(btn => {
    btn.classList.toggle('swatch-ativo', btn.dataset.cor.toLowerCase() === cor.toLowerCase());
  });
  document.getElementById('corSecundaria').value = cor;
  document.documentElement.style.setProperty('--cor-destaque', cor);
}

function carregarConfiguracoes() {
  temaSelecionado = localStorage.getItem('config_tema') || 'claro';
  const largura = localStorage.getItem('config_largura') || '80';
  const somAtivo = localStorage.getItem('config_som') !== 'false';
  const volume = localStorage.getItem('config_volume') || '70';
  corSelecionada = localStorage.getItem('config_cor') || '#D4537E';

  aplicarTemaVisual(temaSelecionado);
  aplicarCorVisual(corSelecionada);

  document.getElementById('larguraSelect').value = largura;
  document.getElementById('somAtivo').checked = somAtivo;
  document.getElementById('volumeRange').value = volume;
  document.getElementById('volumeRotulo').textContent = volume + '%';
}

document.querySelectorAll('#segmentadoTema .segmentado-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    temaSelecionado = btn.dataset.tema;
    aplicarTemaVisual(temaSelecionado);
  });
});

document.querySelectorAll('#paletaCores .swatch').forEach(btn => {
  btn.addEventListener('click', () => {
    corSelecionada = btn.dataset.cor;
    aplicarCorVisual(corSelecionada);
  });
});

document.getElementById('corSecundaria').addEventListener('input', (e) => {
  corSelecionada = e.target.value;
  aplicarCorVisual(corSelecionada);
});

document.getElementById('volumeRange').addEventListener('input', (e) => {
  document.getElementById('volumeRotulo').textContent = e.target.value + '%';
});

document.getElementById('btnSalvarConfig').addEventListener('click', () => {
  const largura = document.getElementById('larguraSelect').value;
  const somAtivo = document.getElementById('somAtivo').checked;
  const volume = document.getElementById('volumeRange').value;

  localStorage.setItem('config_tema', temaSelecionado);
  localStorage.setItem('config_largura', largura);
  localStorage.setItem('config_som', somAtivo);
  localStorage.setItem('config_volume', volume);
  localStorage.setItem('config_cor', corSelecionada);

  mostrarToast('Configurações salvas!');
});

carregarConfiguracoes();
