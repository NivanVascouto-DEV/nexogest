const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM pedidos');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar pedidos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes } = req.body;
        const resultado = await pool.query(
            'INSERT INTO pedidos (cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes]
        );
        req.app.get('io').emit('novo-pedido', resultado.rows[0]);
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao criar pedido' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes } = req.body;
        const resultado = await pool.query(
            'UPDATE pedidos SET cliente_id = $1, usuario_id = $2, canal_venda = $3, status = $4, forma_pagamento = $5, total = $6, observacoes = $7 WHERE id = $8 RETURNING *',
            [cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes, id]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar pedido' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
        res.json({ mensagem: 'Pedido excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir pedido' });
    }
});

module.exports = router;