const CACHE_NOME = 'nexogest-v7';
const ARQUIVOS_ESTATICOS = [
  'login.html',
  'venda.html',
  'pedidos.html',
  'produtos.html',
  'clientes.html',
  'estoque.html',
  'financeiro.html',
  'historico.html',
  'custo.html',
  'configuracoes.html',
  'css/style.css',
  'js/config.js',
  'js/menu.js',
  'js/login.js',
  'js/venda.js',
  'js/pedidos.js',
  'js/produtos.js',
  'js/clientes.js',
  'js/estoque.js',
  'js/financeiro.js',
  'js/historico.js',
  'js/custo.js',
  'js/configuracoes.js',
  'js/socket.io.min.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NOME).then((cache) => Promise.all(
      // cache.addAll() por si so pode reaproveitar uma resposta ja
      // guardada no cache HTTP do navegador (nao no Cache Storage do
      // service worker). Usamos cache: 'reload' em cada fetch para
      // garantir que o que entra no Cache Storage vem sempre da rede.
      ARQUIVOS_ESTATICOS.map((url) => fetch(url, { cache: 'reload' }).then((resposta) => cache.put(url, resposta)))
    ))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) => Promise.all(
      nomes.filter((nome) => nome !== CACHE_NOME).map((nome) => caches.delete(nome))
    ))
  );
  self.clients.claim();
});

// Network-first: sempre busca a versao mais recente quando ha conexao,
// e so recorre ao cache se a rede falhar (quedas curtas de internet).
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || request.url.indexOf(self.location.origin) !== 0) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NOME).then((cache) => cache.put(request, copia));
        return resposta;
      })
      .catch(() => caches.match(request))
  );
});
