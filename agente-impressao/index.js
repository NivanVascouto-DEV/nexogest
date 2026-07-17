const path = require('path');
const open = require('open');

// Quando empacotado com pkg, process.pkg existe e process.execPath aponta para
// o proprio .exe — usamos a pasta dele para achar o .env que fica ao LADO do
// executavel (nao embutido no pacote), para que cada computador configure sua
// propria impressora sem precisar recompilar nada. Rodando via "node index.js"
// (fora do pkg), usamos __dirname normalmente.
const pastaBase = process.pkg ? path.dirname(process.execPath) : __dirname;
require('dotenv').config({ path: path.join(pastaBase, '.env') });

const { io } = require('socket.io-client');
const { criarImpressora, montarCupomEstabelecimento, montarCupomCliente, enviarParaImpressora } = require('./src/impressao');

const BACKEND_URL = process.env.BACKEND_URL;
const URL_LOGIN = 'https://nexogest.netlify.app/login.html';

if (!BACKEND_URL) {
  console.error(`Defina BACKEND_URL no .env ao lado deste programa (${path.join(pastaBase, '.env')}).`);
  console.error('Exemplo: BACKEND_URL=https://seu-backend.onrender.com');
  process.exit(1);
}

// child_process.exec('start "" "URL"') e o jeito classico de abrir uma URL no
// Windows, mas dentro de um .exe empacotado com pkg ele pode reportar sucesso
// sem realmente abrir nada visivel (o cmd.exe /c "start ..." e disparado, mas
// nao necessariamente resulta numa janela de navegador na tela). A biblioteca
// "open" evita esse problema no Windows: em vez de shell string + cmd.exe, ela
// chama powershell.exe com -EncodedCommand executando Start-Process, um
// caminho totalmente diferente que testamos e confirmamos funcionar tanto via
// "node index.js" quanto no .exe compilado pelo pkg.
async function abrirNavegador(url) {
  try {
    await open(url);
    console.log(`[agente-impressao] Navegador aberto em ${url}`);
  } catch (erro) {
    console.error('[agente-impressao] Não foi possível abrir o navegador automaticamente. Erro completo:');
    console.error(erro);
    console.error(`[agente-impressao] Acesse manualmente: ${url}`);
  }
}

// io-client reconecta automaticamente por padrao; deixamos as opcoes explicitas
// so para documentar o comportamento (tentativas infinitas, com um intervalo
// curto entre elas), ja que este agente precisa ficar rodando o dia inteiro.
const socket = io(BACKEND_URL, {
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity
});

socket.on('connect', () => {
  console.log(`[agente-impressao] Conectado ao backend em ${BACKEND_URL}`);
  socket.emit('registrar-agente');
});

socket.on('disconnect', (motivo) => {
  console.log(`[agente-impressao] Desconectado do backend (${motivo}). Tentando reconectar...`);
});

socket.on('connect_error', (erro) => {
  console.error('[agente-impressao] Erro ao conectar ao backend:', erro.message);
});

socket.on('reconnect', (tentativa) => {
  console.log(`[agente-impressao] Reconectado ao backend (tentativa ${tentativa}).`);
  socket.emit('registrar-agente');
});

socket.on('imprimir-pedido', async ({ tipo, largura, dados }) => {
  const numeroPedido = dados && dados.pedido ? dados.pedido.id : '?';
  console.log(`[agente-impressao] Recebido pedido de impressão: pedido #${numeroPedido}, via "${tipo}"`);

  try {
    const printer = criarImpressora(largura);

    if (tipo === 'estabelecimento') {
      montarCupomEstabelecimento(printer, dados);
    } else {
      montarCupomCliente(printer, dados);
    }

    await enviarParaImpressora(printer);
    console.log(`[agente-impressao] Pedido #${numeroPedido} (${tipo}) impresso com sucesso.`);
  } catch (erro) {
    console.error(`[agente-impressao] Falha ao imprimir pedido #${numeroPedido} (${tipo}):`, erro.message);
  }
});

console.log('[agente-impressao] Iniciando... aguardando conexão com o backend.');
abrirNavegador(URL_LOGIN);
