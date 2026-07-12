const express = require('express');
const pool = require('./db');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const servidorHttp = http.createServer(app);
const io = new Server(servidorHttp, {
  cors: { origin: '*' }
});
app.set('io', io);

app.use(express.json());
app.use(cors());

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