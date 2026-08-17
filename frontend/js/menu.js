const LOGO_SVG = '<svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2C8 2 5 6 5 10c0 2.5 1.2 4 2.5 5.3L8 24h10l0.5-8.7C19.8 14 21 12.5 21 10c0-4-3-8-8-8z" fill="#fff" fill-opacity="0.95"/><path d="M9 10.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#D4537E" stroke-width="1.3" stroke-linecap="round" fill="none"/><circle cx="13" cy="10.5" r="1.4" fill="#D4537E"/></svg>';

const ICONES_MENU = {
  venda: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>',
  pedidos: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l5 5v13H6z"></path><path d="M15 3v5h5M9 13h6M9 17h4"></path></svg>',
  produtos: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"></path></svg>',
  estoque: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-4 9 4v8l-9 4-9-4z"></path><path d="M3 8l9 4 9-4M12 12v8"></path></svg>',
  clientes: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"></circle><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"></path></svg>',
  financeiro: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"></path></svg>',
  historico: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path></svg>',
  custo: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2.5"></rect><path d="M9 8h6M9 12h2M13 12h2M9 16h2M13 16h2"></path></svg>',
  configuracoes: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2 2 2 0 11-4 0 1.7 1.7 0 00-2.9-1.2l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.7 1.7 0 003 15a2 2 0 110-4 1.7 1.7 0 001.2-2.9l-.1-.1a2 2 0 112.8-2.8l.1.1A1.7 1.7 0 0010 4.2a2 2 0 114 0 1.7 1.7 0 002.9 1.2l.1-.1a2 2 0 112.8 2.8l-.1.1A1.7 1.7 0 0021 11a2 2 0 110 4z"></path></svg>',
  sair: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17l5-5-5-5M20 12H9M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h5"></path></svg>'
};

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

// Grupos de navegação da sidebar, seguindo a mesma organização do design de
// referência (Operação / Cadastros / Gestão), com Configurações e Sair fora
// dos grupos, fixados no rodapé.
const GRUPOS_MENU = [
  {
    titulo: 'Operação',
    paginas: [
      { arquivo: 'venda.html', label: 'Novo pedido', icone: 'venda' },
      { arquivo: 'pedidos.html', label: 'Pedidos', icone: 'pedidos' }
    ]
  },
  {
    titulo: 'Cadastros',
    paginas: [
      { arquivo: 'produtos.html', label: 'Cardápio', icone: 'produtos' },
      { arquivo: 'estoque.html', label: 'Estoque', icone: 'estoque' },
      { arquivo: 'clientes.html', label: 'Clientes', icone: 'clientes' }
    ]
  },
  {
    titulo: 'Gestão',
    paginas: [
      { arquivo: 'financeiro.html', label: 'Financeiro', icone: 'financeiro', restrito: true },
      { arquivo: 'historico.html', label: 'Histórico', icone: 'historico', restrito: true },
      { arquivo: 'custo.html', label: 'Custo', icone: 'custo', restrito: true }
    ]
  }
];

function criarMenu() {
  const papel = localStorage.getItem('papel');

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
    <div class="sidebar-logo-texto">
      <span>NexoGest</span>
      <span class="sidebar-data">${formatarDataPortugues(new Date())}</span>
    </div>
  `;
  sidebar.appendChild(logo);

  const linksContainer = document.createElement('div');
  linksContainer.className = 'sidebar-links';

  function criarLink(pagina) {
    const link = document.createElement('a');
    link.href = pagina.arquivo;
    link.className = 'menu-link';
    link.innerHTML = `${ICONES_MENU[pagina.icone]}<span>${pagina.label}</span>`;
    if (pagina.arquivo === paginaAtual) link.classList.add('menu-link-ativo');
    return link;
  }

  GRUPOS_MENU.forEach(grupo => {
    const paginasVisiveis = grupo.paginas.filter(p => !p.restrito || papel === 'admin' || papel === 'contador');
    if (paginasVisiveis.length === 0) return;

    const titulo = document.createElement('div');
    titulo.className = 'menu-secao-titulo';
    titulo.textContent = grupo.titulo;
    linksContainer.appendChild(titulo);

    paginasVisiveis.forEach(pagina => linksContainer.appendChild(criarLink(pagina)));
  });

  sidebar.appendChild(linksContainer);

  const rodape = document.createElement('div');
  rodape.className = 'sidebar-rodape';

  const linkConfig = criarLink({ arquivo: 'configuracoes.html', label: 'Configurações', icone: 'configuracoes' });
  rodape.appendChild(linkConfig);

  const btnSair = document.createElement('button');
  btnSair.className = 'menu-sair';
  btnSair.innerHTML = `${ICONES_MENU.sair}<span>Sair</span>`;
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
  rodape.appendChild(btnSair);

  sidebar.appendChild(rodape);

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
