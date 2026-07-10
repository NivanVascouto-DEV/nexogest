const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM ficha_tecnica');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar ficha técnica' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { produto_id, insumo_id, quantidade_usada } = req.body;
        const resultado = await pool.query(
            'INSERT INTO ficha_tecnica (produto_id, insumo_id, quantidade_usada) VALUES ($1, $2, $3) RETURNING *',
            [produto_id, insumo_id, quantidade_usada]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao criar item da ficha técnica' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { produto_id, insumo_id, quantidade_usada } = req.body;
        const resultado = await pool.query(
            'UPDATE ficha_tecnica SET produto_id = $1, insumo_id = $2, quantidade_usada = $3 WHERE id = $4 RETURNING *',
            [produto_id, insumo_id, quantidade_usada, id]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar item da ficha técnica' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM ficha_tecnica WHERE id = $1', [id]);
        res.json({ mensagem: 'Item da ficha técnica excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir item da ficha técnica' });
    }
});

// Rota especial: buscar a ficha técnica completa de UM produto (com nomes dos insumos)
router.get('/produto/:produtoId', async (req, res) => {
    try {
        const { produtoId } = req.params;
        const resultado = await pool.query(
            `SELECT ft.id, ft.quantidade_usada, i.nome, i.unidade_medida, i.custo_por_unidade
             FROM ficha_tecnica ft
             JOIN insumos i ON i.id = ft.insumo_id
             WHERE ft.produto_id = $1`,
            [produtoId]
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar ficha técnica do produto' });
    }
});

module.exports = router;