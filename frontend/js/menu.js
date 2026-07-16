const LOGO_SVG = '<svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2C8 2 5 6 5 10c0 2.5 1.2 4 2.5 5.3L8 24h10l0.5-8.7C19.8 14 21 12.5 21 10c0-4-3-8-8-8z" fill="#fff" fill-opacity="0.95"/><path d="M9 10.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#D4537E" stroke-width="1.3" stroke-linecap="round" fill="none"/><circle cx="13" cy="10.5" r="1.4" fill="#D4537E"/></svg>';

function formatarDataPortugues(data) {
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${data.getDate()} de ${meses[data.getMonth()]}`;
}

const SUBTITULOS = {
  'venda.html': 'Registrar pedido',
  'pedidos.html': 'Acompanhe os pedidos por status',
  'produtos.html': 'Produtos cadastrados',
  'estoque.html': 'Controle de produtos com estoque ativado',
  'clientes.html': 'Clientes cadastrados automaticamente na Venda',
  'financeiro.html': 'DRE e despesas',
  'historico.html': 'Histórico de vendas',
  'custo.html': 'Calculadora de custo de produção',
  'configuracoes.html': 'Preferências do sistema'
};

function criarMenu() {
  const papel = localStorage.getItem('papel');

  const paginas = [
    { arquivo: 'venda.html', label: 'Novo pedido' },
    { arquivo: 'pedidos.html', label: 'Pedidos' },
    { arquivo: 'produtos.html', label: 'Produtos' },
    { arquivo: 'estoque.html', label: 'Estoque' },
    { arquivo: 'clientes.html', label: 'Clientes' },
    { arquivo: 'financeiro.html', label: 'Financeiro', restrito: true },
    { arquivo: 'historico.html', label: 'Histórico', restrito: true },
    { arquivo: 'configuracoes.html', label: 'Configurações' }
  ];

  const paginaAtual = window.location.pathname.split('/').pop();

  const conteudoOriginal = Array.from(document.body.children);
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';
  conteudoOriginal.forEach(el => pageContent.appendChild(el));

  const h1 = pageContent.querySelector('h1');
  if (h1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'titulo-secao';
    h1.parentNode.insertBefore(wrapper, h1);
    wrapper.appendChild(h1);

    const subtitulo = SUBTITULOS[paginaAtual];
    if (subtitulo) {
      const p = document.createElement('p');
      p.className = 'subtitulo-pagina';
      p.textContent = subtitulo;
      wrapper.parentNode.insertBefore(p, wrapper.nextSibling);
    }
  }

  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';

  const logo = document.createElement('div');
  logo.className = 'sidebar-logo';
  logo.innerHTML = `
    <div class="logo-quadrado">${LOGO_SVG}</div>
    <span>NexoGest</span>
    <span class="sidebar-data">${formatarDataPortugues(new Date())}</span>
  `;
  sidebar.appendChild(logo);

  const linksContainer = document.createElement('div');
  linksContainer.className = 'sidebar-links';

  paginas.forEach(pagina => {
    if (pagina.restrito && papel !== 'admin' && papel !== 'contador') return;

    const link = document.createElement('a');
    link.href = pagina.arquivo;
    link.textContent = pagina.label;
    link.className = 'menu-link';
    if (pagina.arquivo === paginaAtual) link.classList.add('menu-link-ativo');

    linksContainer.appendChild(link);
  });

  sidebar.appendChild(linksContainer);

  const btnSair = document.createElement('button');
  btnSair.textContent = 'Sair';
  btnSair.className = 'menu-sair';
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
  sidebar.appendChild(btnSair);

  const overlayMenu = document.createElement('div');
  overlayMenu.className = 'overlay-menu';

  const topbarMobile = document.createElement('div');
  topbarMobile.className = 'topbar-mobile';
  topbarMobile.innerHTML = `
    <button type="button" class="btn-menu-mobile" aria-label="Abrir menu">☰</button>
    <div class="topbar-mobile-logo">
      <div class="logo-quadrado logo-quadrado-mini">${LOGO_SVG}</div>
      <span>NexoGest</span>
    </div>
  `;

  function fecharMenuMobile() {
    sidebar.classList.remove('sidebar-aberta');
    overlayMenu.classList.remove('overlay-visivel');
  }

  topbarMobile.querySelector('.btn-menu-mobile').addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-aberta');
    overlayMenu.classList.toggle('overlay-visivel');
  });

  overlayMenu.addEventListener('click', fecharMenuMobile);

  const appShell = document.createElement('div');
  appShell.className = 'app-shell';
  appShell.appendChild(sidebar);
  appShell.appendChild(pageContent);

  document.body.appendChild(topbarMobile);
  document.body.appendChild(overlayMenu);
  document.body.appendChild(appShell);
}

criarMenu();

const temaSalvo = localStorage.getItem('config_tema');
if (temaSalvo === 'escuro') {
  document.body.classList.add('dark-mode');
}

const corSalva = localStorage.getItem('config_cor');
if (corSalva) {
  document.documentElement.style.setProperty('--cor-destaque', corSalva);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then((registro) => {
    // O navegador só reconfere o sw.js a cada 24h por padrão. Forçamos a
    // checagem em toda carga de página para que uma nova versão do cache
    // (ex: nexogest-v4 -> v5) entre em vigor imediatamente, sem depender
    // de esperar o navegador decidir revalidar por conta própria.
    registro.update();
  });

  let jaRecarregou = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (jaRecarregou) return;
    jaRecarregou = true;
    window.location.reload();
  });
}

let __audioCtx = null;

function obterAudioContext() {
  if (!__audioCtx) {
    const AudioContextClasse = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClasse) return null;
    __audioCtx = new AudioContextClasse();
  }
  return __audioCtx;
}

// Navegadores suspendem o AudioContext ate a primeira interacao do usuario
// (politica de autoplay). Destrava assim que o usuario tocar/clicar na tela.
['click', 'keydown', 'touchstart'].forEach((evento) => {
  document.addEventListener(evento, () => {
    const ctx = obterAudioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }, { once: true });
});

function tocarSomNotificacao() {
  const somAtivo = localStorage.getItem('config_som') !== 'false';
  if (!somAtivo) return;

  const ctx = obterAudioContext();
  if (!ctx) return;

  const volume = (parseInt(localStorage.getItem('config_volume'), 10) || 70) / 100;

  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 880;
  ganho.gain.value = volume * 0.3;

  osc.connect(ganho);
  ganho.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function mostrarToast(mensagem) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensagem;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-visivel'));

  setTimeout(() => {
    toast.classList.remove('toast-visivel');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}
