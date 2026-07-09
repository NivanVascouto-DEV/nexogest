const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM itens_pedido');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar itens de pedido' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
        const resultado = await pool.query(
            'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
            [pedido_id, produto_id, quantidade, preco_unitario]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao criar item de pedido' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
        const resultado = await pool.query(
            'UPDATE itens_pedido SET pedido_id = $1, produto_id = $2, quantidade = $3, preco_unitario = $4 WHERE id = $5 RETURNING *',
            [pedido_id, produto_id, quantidade, preco_unitario, id]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar item de pedido' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM itens_pedido WHERE id = $1', [id]);
        res.json({ mensagem: 'Item de pedido excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir item de pedido' });
    }
});

module.exports = router;