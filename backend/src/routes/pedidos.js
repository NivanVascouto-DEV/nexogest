const express = require('express');
const router = express.Router();
const pool = require('../db');
const { buscarDadosPedido } = require('../impressao');

const SALA_AGENTES_IMPRESSAO = 'agentes-impressao';

function haAgenteConectado(io) {
    const sala = io.sockets.adapter.rooms.get(SALA_AGENTES_IMPRESSAO);
    return !!sala && sala.size > 0;
}

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
        const { cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes, valor_recebido } = req.body;
        const resultado = await pool.query(
            'INSERT INTO pedidos (cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes, valor_recebido) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes, valor_recebido]
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
        const { cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes, valor_recebido } = req.body;
        const resultado = await pool.query(
            'UPDATE pedidos SET cliente_id = $1, usuario_id = $2, canal_venda = $3, status = $4, forma_pagamento = $5, total = $6, observacoes = $7, valor_recebido = $8 WHERE id = $9 RETURNING *',
            [cliente_id, usuario_id, canal_venda, status, forma_pagamento, total, observacoes, valor_recebido, id]
        );
        req.app.get('io').emit('pedido-atualizado', resultado.rows[0]);
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

router.post('/:id/imprimir/estabelecimento', async (req, res) => {
    try {
        const { id } = req.params;
        const { largura } = req.body;
        const io = req.app.get('io');

        const dados = await buscarDadosPedido(id);
        if (!dados) {
            return res.status(404).json({ mensagem: 'Pedido não encontrado' });
        }

        if (!haAgenteConectado(io)) {
            return res.status(503).json({ mensagem: 'Nenhum agente de impressão conectado no momento.' });
        }

        io.to(SALA_AGENTES_IMPRESSAO).emit('imprimir-pedido', { tipo: 'estabelecimento', largura, dados });
        res.json({ mensagem: 'Via da cozinha enviada para o agente de impressão' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao solicitar impressão da via da cozinha.' });
    }
});

router.post('/:id/imprimir/cliente', async (req, res) => {
    try {
        const { id } = req.params;
        const { largura } = req.body;
        const io = req.app.get('io');

        const dados = await buscarDadosPedido(id);
        if (!dados) {
            return res.status(404).json({ mensagem: 'Pedido não encontrado' });
        }

        if (!haAgenteConectado(io)) {
            return res.status(503).json({ mensagem: 'Nenhum agente de impressão conectado no momento.' });
        }

        io.to(SALA_AGENTES_IMPRESSAO).emit('imprimir-pedido', { tipo: 'cliente', largura, dados });
        res.json({ mensagem: 'Via do cliente enviada para o agente de impressão' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao solicitar impressão da via do cliente.' });
    }
});

module.exports = router;