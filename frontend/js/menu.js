const ICONES_SECAO = {
  carrinho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2.5 3h2l2.6 12.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/></svg>',
  prancheta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h6"/></svg>',
  etiqueta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 12.3 12.3 20.6a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1 0-2.9L10.8 2h5.7a4 4 0 0 1 4 4v5.7Z"/><circle cx="16" cy="8" r="1.3"/></svg>',
  caixa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/><path d="M20.7 7.3v9.4a1.6 1.6 0 0 1-.8 1.4l-7 4a1.6 1.6 0 0 1-1.8 0l-7-4a1.6 1.6 0 0 1-.8-1.4V7.3a1.6 1.6 0 0 1 .8-1.4l7-4a1.6 1.6 0 0 1 1.8 0l7 4a1.6 1.6 0 0 1 .8 1.4Z"/></svg>',
  pessoas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="8.5" r="2.4"/><path d="M16 14.2c2.4.5 4 2.6 4 5.3"/></svg>',
  cifrao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 15.2c.3 1 1.2 1.6 2.5 1.6 1.6 0 2.6-.8 2.6-2 0-3-5.6-1.7-5.6-4.6 0-1.2 1-2 2.5-2 1.3 0 2.2.6 2.5 1.6"/></svg>',
  relogio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  calculadora: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 6.5h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>',
  engrenagem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>'
};

function criarMenu() {
  const papel = localStorage.getItem('papel');

  const paginas = [
    { arquivo: 'venda.html', label: 'Venda', icone: 'carrinho', grupo: 'vendas' },
    { arquivo: 'pedidos.html', label: 'Pedidos', icone: 'prancheta', grupo: 'operacional' },
    { arquivo: 'produtos.html', label: 'Produtos', icone: 'etiqueta', grupo: 'vendas' },
    { arquivo: 'estoque.html', label: 'Estoque', icone: 'caixa', grupo: 'operacional' },
    { arquivo: 'clientes.html', label: 'Clientes', icone: 'pessoas', grupo: 'pessoas' },
    { arquivo: 'financeiro.html', label: 'Financeiro', icone: 'cifrao', grupo: 'financeiro', restrito: true },
    { arquivo: 'historico.html', label: 'Histórico', icone: 'relogio', grupo: 'historico', restrito: true },
    { arquivo: 'custo.html', label: 'Custo', icone: 'calculadora', grupo: 'custo', restrito: true },
    { arquivo: 'configuracoes.html', label: 'Configurações', icone: 'engrenagem', grupo: 'neutro' }
  ];

  const paginaAtual = window.location.pathname.split('/').pop();

  const conteudoOriginal = Array.from(document.body.children);
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';
  conteudoOriginal.forEach(el => pageContent.appendChild(el));

  const paginaInfo = paginas.find(p => p.arquivo === paginaAtual);
  if (paginaInfo) {
    const h1 = pageContent.querySelector('h1');
    if (h1) {
      const wrapper = document.createElement('div');
      wrapper.className = 'titulo-secao';
      const badge = document.createElement('div');
      badge.className = 'icone-secao grupo-' + paginaInfo.grupo;
      badge.innerHTML = ICONES_SECAO[paginaInfo.icone] || '';
      h1.parentNode.insertBefore(wrapper, h1);
      wrapper.appendChild(badge);
      wrapper.appendChild(h1);
    }
  }

  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';

  const logo = document.createElement('div');
  logo.className = 'sidebar-logo';
  logo.innerHTML = '<div class="logo-quadrado"></div><span>NexoGest</span>';
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

  const appShell = document.createElement('div');
  appShell.className = 'app-shell';
  appShell.appendChild(sidebar);
  appShell.appendChild(pageContent);

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
