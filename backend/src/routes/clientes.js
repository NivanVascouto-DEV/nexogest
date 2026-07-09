const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    const resultado = await pool.query('SELECT * FROM clientes');
    res.json(resultado.rows);
});

router.post('/', async (req, res) => {
    const { nome, telefone, endereco } = req.body;
    const resultado = await pool.query(
        'INSERT INTO clientes (nome, telefone, endereco) VALUES ($1, $2, $3) RETURNING *',
        [nome, telefone, endereco]
    );
    res.json(resultado.rows[0]);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, endereco } = req.body;
    const resultado = await pool.query(
        'UPDATE clientes SET nome = $1, telefone = $2, endereco = $3 WHERE id = $4 RETURNING *',
        [nome, telefone, endereco, id]
    );
    res.json(resultado.rows[0]);
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query(
        'DELETE FROM clientes WHERE id = $1',
        [id]
    );
    res.json({ mensagem: 'Cliente excluído com sucesso' });
});

module.exports = router;