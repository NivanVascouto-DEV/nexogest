const express = require('express');
const pool = require('./db')
const app = express();

app.get('/teste-db', async (req, res) => {
  const resultado = await pool.query('SELECT NOW()');
  res.send(resultado.rows);
});

app.get('/', (req, res) => {
  res.send('NexoGest backend rodando!');
});

app.listen(3000, () =>{
    console.log('Servidor rodando na porta 3000');
});
