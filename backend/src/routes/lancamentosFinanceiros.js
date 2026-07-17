const express = require('express');
const router = express.Router();
const pool = require('../db');

const CATEGORIAS_VALIDAS = ['pessoal', 'administrativa', 'marketing', 'tributos', 'financeira', 'cmv'];

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM lancamentos_financeiros ORDER BY data_lancamento DESC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar lançamentos financeiros' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { tipo, categoria, descricao, valor, forma_pagamento, data_vencimento } = req.body;

        if (!CATEGORIAS_VALIDAS.includes(categoria)) {
            return res.status(400).json({ mensagem: 'Categoria inválida' });
        }

        const resultado = await pool.query(
            'INSERT INTO lancamentos_financeiros (tipo, categoria, descricao, valor, forma_pagamento, data_vencimento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [tipo, categoria, descricao, valor, forma_pagamento, data_vencimento]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao criar lançamento financeiro' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, categoria, descricao, valor, forma_pagamento, status } = req.body;

        if (!CATEGORIAS_VALIDAS.includes(categoria)) {
            return res.status(400).json({ mensagem: 'Categoria inválida' });
        }

        const resultado = await pool.query(
            'UPDATE lancamentos_financeiros SET tipo = $1, categoria = $2, descricao = $3, valor = $4, forma_pagamento = $5, status = $6 WHERE id = $7 RETURNING *',
            [tipo, categoria, descricao, valor, forma_pagamento, status, id]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar lançamento financeiro' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM lancamentos_financeiros WHERE id = $1', [id]);
        res.json({ mensagem: 'Lançamento excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir lançamento' });
    }
});

module.exports = router;