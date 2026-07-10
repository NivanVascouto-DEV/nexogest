const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM produtos');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar produtos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, preco, codigo } = req.body;
        const resultado = await pool.query(
            'INSERT INTO produtos (nome, preco, codigo) VALUES ($1, $2, $3) RETURNING *',
            [nome, preco, codigo]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao criar produto' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, preco, codigo } = req.body;
        const resultado = await pool.query(
            'UPDATE produtos SET nome = $1, preco = $2, codigo = $3 WHERE id = $4 RETURNING *',
            [nome, preco, codigo, id]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar produto' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
        res.json({ mensagem: 'Produto excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir produto' });
    }
});

router.get('/:id/custo', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query(
            `SELECT SUM(ft.quantidade_usada * i.custo_por_unidade) AS custo_total
             FROM ficha_tecnica ft
             JOIN insumos i ON i.id = ft.insumo_id
             WHERE ft.produto_id = $1`,
            [id]
        );
        res.json({ custo_producao: resultado.rows[0].custo_total });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao calcular custo do produto' });
    }
});

module.exports = router;