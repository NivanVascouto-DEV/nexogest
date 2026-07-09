const express = require('express');
const pool = require('./db');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('NexoGest backend rodando!');
});

app.get('/teste-db', async (req, res) => {
  const resultado = await pool.query('SELECT NOW()');
  res.send(resultado.rows);
});

const produtosRoutes = require('./routes/produtos');
app.use('/produtos', produtosRoutes);

const clientesRoutes = require('./routes/clientes');
app.use('/clientes', clientesRoutes);

const pedidosRoutes = require('./routes/pedidos');
app.use('/pedidos', pedidosRoutes);

const itensPedidoRoutes = require('./routes/itensPedido');
app.use('/itens-pedido', itensPedidoRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});