const pool = require('./db');

// So busca os dados do pedido no banco. A montagem do cupom e o envio para a
// impressora fisica agora sao responsabilidade do agente de impressao local
// (ver agente-impressao/), ja que o backend passou a rodar na nuvem e nao tem
// mais acesso a nenhuma impressora — os dados retornados aqui sao enviados
// para o agente via Socket.io (ver routes/pedidos.js).
async function buscarDadosPedido(id) {
  const resultadoPedido = await pool.query(
    `SELECT p.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone, c.endereco AS cliente_endereco,
            u.nome AS usuario_nome
     FROM pedidos p
     LEFT JOIN clientes c ON c.id = p.cliente_id
     LEFT JOIN usuarios u ON u.id = p.usuario_id
     WHERE p.id = $1`,
    [id]
  );
  if (resultadoPedido.rows.length === 0) return null;

  const resultadoItens = await pool.query(
    `SELECT ip.quantidade, ip.preco_unitario, pr.nome AS produto_nome, pr.unidade_venda AS produto_unidade
     FROM itens_pedido ip
     JOIN produtos pr ON pr.id = ip.produto_id
     WHERE ip.pedido_id = $1`,
    [id]
  );

  return { pedido: resultadoPedido.rows[0], itens: resultadoItens.rows };
}

module.exports = {
  buscarDadosPedido
};
