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
    { arquivo: 'produtos.html', label: 'Cardápio' },
    { arquivo: 'estoque.html', label: 'Estoque' },
    { arquivo: 'clientes.html', label: 'Clientes' },
    { arquivo: 'financeiro.html', label: 'Financeiro', restrito: true },
    { arquivo: 'historico.html', label: 'Histórico', restrito: true },
    { arquivo: 'custo.html', label: 'Custo', restrito: true },
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
