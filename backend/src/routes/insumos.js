const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM insumos');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar insumos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, unidade_medida, custo_por_unidade } = req.body;
        const resultado = await pool.query(
            'INSERT INTO insumos (nome, unidade_medida, custo_por_unidade) VALUES ($1, $2, $3) RETURNING *',
            [nome, unidade_medida, custo_por_unidade]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao criar insumo' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, unidade_medida, custo_por_unidade } = req.body;
        const resultado = await pool.query(
            'UPDATE insumos SET nome = $1, unidade_medida = $2, custo_por_unidade = $3 WHERE id = $4 RETURNING *',
            [nome, unidade_medida, custo_por_unidade, id]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar insumo' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM insumos WHERE id = $1', [id]);
        res.json({ mensagem: 'Insumo excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir insumo' });
    }
});

module.exports = router;