const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/dre', async (req, res) => {
    try {
        const receitaResultado = await pool.query('SELECT SUM(total) AS receita_bruta FROM pedidos');
        const receitaBruta = parseFloat(receitaResultado.rows[0].receita_bruta) || 0;

        const cmvResultado = await pool.query(`
            SELECT SUM(ip.quantidade * ft_custo.custo_unitario) AS cmv_total
            FROM itens_pedido ip
            JOIN (
                SELECT ft.produto_id, SUM(ft.quantidade_usada * i.custo_por_unidade) AS custo_unitario
                FROM ficha_tecnica ft
                JOIN insumos i ON i.id = ft.insumo_id
                GROUP BY ft.produto_id
            ) ft_custo ON ft_custo.produto_id = ip.produto_id
        `);
        const cmv = parseFloat(cmvResultado.rows[0].cmv_total) || 0;

        const lucroBruto = receitaBruta - cmv;

        const despesasResultado = await pool.query(
            "SELECT SUM(valor) AS total_despesas FROM lancamentos_financeiros WHERE tipo = 'saida'"
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

module.exports = router;