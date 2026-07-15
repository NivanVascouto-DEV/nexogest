const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const incluirInativos = req.query.todos === '1' || req.query.todos === 'true';
        const resultado = await pool.query(
            incluirInativos ? 'SELECT * FROM clientes' : 'SELECT * FROM clientes WHERE ativo = true'
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar clientes' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, telefone, endereco } = req.body;
        const resultado = await pool.query(
            'INSERT INTO clientes (nome, telefone, endereco) VALUES ($1, $2, $3) RETURNING *',
            [nome, telefone, endereco]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao criar cliente' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, telefone, endereco } = req.body;
        const resultado = await pool.query(
            'UPDATE clientes SET nome = $1, telefone = $2, endereco = $3 WHERE id = $4 RETURNING *',
            [nome, telefone, endereco, id]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar cliente' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE clientes SET ativo = false WHERE id = $1', [id]);
        res.json({ mensagem: 'Cliente desativado com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir cliente' });
    }
});

module.exports = router;