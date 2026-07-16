const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/dre', async (req, res) => {
    try {
        const receitaResultado = await pool.query('SELECT SUM(total) AS receita_bruta FROM pedidos');
        const receitaBruta = parseFloat(receitaResultado.rows[0].receita_bruta) || 0;

        const cmvResultado = await pool.query(
            "SELECT SUM(valor) AS cmv_total FROM lancamentos_financeiros WHERE tipo = 'saida' AND categoria = 'cmv'"
        );
        const cmv = parseFloat(cmvResultado.rows[0].cmv_total) || 0;

        const lucroBruto = receitaBruta - cmv;

        const despesasResultado = await pool.query(
            "SELECT SUM(valor) AS total_despesas FROM lancamentos_financeiros WHERE tipo = 'saida' AND categoria != 'cmv'"
        );
        const despesas = parseFloat(despesasResultado.rows[0].total_despesas) || 0;

        const lucroLiquido = lucroBruto - despesas;

        res.json({
            receita_bruta: receitaBruta,
            cmv: cmv,
            lucro_bruto: lucroBruto,
            despesas: despesas,
            lucro_liquido: lucroLiquido
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao calcular DRE' });
    }
});

router.get('/pagamentos', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT forma_pagamento, SUM(total) AS total FROM pedidos GROUP BY forma_pagamento'
        );
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao calcular totais por pagamento' });
    }
});

module.exports = router;