const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    const resultado = await pool.query('SELECT * FROM produtos');
    res.json(resultado.rows);
});

router.post('/', async (req, res) => {
    const { nome, preco, codigo } = req.body;
    const resultado = await pool.query(
        'INSERT INTO produtos (nome, preco, codigo) VALUES ($1, $2, $3) RETURNING *',
        [nome, preco, codigo]
    );
    res.json(resultado.rows[0]);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, preco, codigo } = req.body;
    const resultado = await pool.query(
        'UPDATE produtos SET nome = $1, preco = $2, codigo = $3 WHERE id = $4 RETURNING *',
        [nome, preco, codigo, id]
    );
    res.json(resultado.rows[0]);
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query(
        'DELETE FROM produtos WHERE id = $1',
        [id]
    );
    res.json({ mensagem: 'Produto excluído com sucesso' });
});

module.exports = router;
