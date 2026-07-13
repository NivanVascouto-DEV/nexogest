function carregarConfiguracoes() {
  const tema = localStorage.getItem('config_tema') || 'claro';
  const largura = localStorage.getItem('config_largura') || '80';
  const somAtivo = localStorage.getItem('config_som') !== 'false';
  const volume = localStorage.getItem('config_volume') || '70';
  const cor = localStorage.getItem('config_cor') || '#D4537E';

  document.getElementById('temaSelect').value = tema;
  document.getElementById('larguraSelect').value = largura;
  document.getElementById('somAtivo').checked = somAtivo;
  document.getElementById('volumeRange').value = volume;
  document.getElementById('corSecundaria').value = cor;
}

document.getElementById('btnSalvarConfig').addEventListener('click', () => {
  const tema = document.getElementById('temaSelect').value;
  const largura = document.getElementById('larguraSelect').value;
  const somAtivo = document.getElementById('somAtivo').checked;
  const volume = document.getElementById('volumeRange').value;
  const cor = document.getElementById('corSecundaria').value;

  localStorage.setItem('config_tema', tema);
  localStorage.setItem('config_largura', largura);
  localStorage.setItem('config_som', somAtivo);
  localStorage.setItem('config_volume', volume);
  localStorage.setItem('config_cor', cor);

  document.body.classList.toggle('dark-mode', tema === 'escuro');
  document.documentElement.style.setProperty('--cor-destaque', cor);

  alert('Configurações salvas!');
});

carregarConfiguracoes();