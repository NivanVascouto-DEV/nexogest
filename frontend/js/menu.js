function criarMenu() {
  const papel = localStorage.getItem('papel');

  const paginas = [
    { arquivo: 'venda.html', label: 'Venda' },
    { arquivo: 'pedidos.html', label: 'Pedidos' },
    { arquivo: 'produtos.html', label: 'Produtos' },
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