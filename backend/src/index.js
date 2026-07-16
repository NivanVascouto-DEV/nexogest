const express = require('express');
const pool = require('./db');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Em producao, restringe o CORS a origem do frontend publicado (FRONTEND_URL).
// Sem essa variavel (desenvolvimento local), libera qualquer origem, ja que o
// frontend local pode ser acessado por localhost ou pelo IP da maquina na rede.
const origemPermitida = process.env.FRONTEND_URL || '*';

const servidorHttp = http.createServer(app);
const io = new Server(servidorHttp, {
  cors: { origin: origemPermitida }
});
app.set('io', io);

const SALA_AGENTES_IMPRESSAO = 'agentes-impressao';
io.on('connection', (socket) => {
  socket.on('registrar-agente', () => {
    socket.join(SALA_AGENTES_IMPRESSAO);
    console.log(`Agente de impressão conectado (${socket.id})`);
  });
});

app.use(express.json());
app.use(cors({ origin: origemPermitida }));

app.get('/', (req, res) => {
  res.send('NexoGest backend rodando!');
});

app.get('/teste-db', async (req, res) => {
  const resultado = await pool.query('SELECT NOW()');
  res.send(resultado.rows);
});

const { verificarToken, verificarPapel } = require('./middlewares/auth');

const produtosRoutes = require('./routes/produtos');
app.use('/produtos', verificarToken, produtosRoutes);

const clientesRoutes = require('./routes/clientes');
app.use('/clientes', verificarToken, clientesRoutes);

const pedidosRoutes = require('./routes/pedidos');
app.use('/pedidos', verificarToken, pedidosRoutes);

const itensPedidoRoutes = require('./routes/itensPedido');
app.use('/itens-pedido', verificarToken, itensPedidoRoutes);

const insumosRoutes = require('./routes/insumos');
app.use('/insumos', verificarToken, verificarPapel(['admin', 'contador']), insumosRoutes);

const fichaTecnicaRoutes = require('./routes/fichaTecnica');
app.use('/ficha-tecnica', verificarToken, verificarPapel(['admin', 'contador']), fichaTecnicaRoutes);

const lancamentosRoutes = require('./routes/lancamentosFinanceiros');
app.use('/lancamentos-financeiros', verificarToken, verificarPapel(['admin', 'contador']), lancamentosRoutes);

const usuariosRoutes = require('./routes/usuarios');
app.use('/usuarios', verificarToken, verificarPapel(['admin']), usuariosRoutes);

const relatoriosRoutes = require('./routes/relatorios');
app.use('/relatorios', verificarToken, verificarPapel(['admin', 'contador']), relatoriosRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const PORTA = process.env.PORT || 3000;
servidorHttp.listen(PORTA, () => {
    console.log('Servidor rodando na porta ' + PORTA);
});