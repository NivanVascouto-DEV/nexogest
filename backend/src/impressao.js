const { printer: ThermalPrinter, types: PrinterTypes, characterSet: CharacterSet } = require('node-thermal-printer');
const pool = require('./db');

function formatarDataHora(dataStr) {
  if (!dataStr) return '';
  const [dataParte, horaParte] = String(dataStr).split(' ');
  const [ano, mes, dia] = dataParte.split('-');
  const hora = (horaParte || '').slice(0, 5);
  return `${dia}/${mes}/${ano} ${hora}`;
}

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
    `SELECT ip.quantidade, ip.preco_unitario, pr.nome AS produto_nome
     FROM itens_pedido ip
     JOIN produtos pr ON pr.id = ip.produto_id
     WHERE ip.pedido_id = $1`,
    [id]
  );

  return { pedido: resultadoPedido.rows[0], itens: resultadoItens.rows };
}

function criarImpressora(largura) {
  const charWidth = Number(largura) === 58 ? 32 : 48;
  return new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: process.env.PRINTER_INTERFACE || 'file:nao-configurada',
    width: charWidth,
    removeSpecialCharacters: false,
    characterSet: CharacterSet.PC860_PORTUGUESE
  });
}

// Via interna, para quem prepara o pedido: densa, prioriza não perder informação.
function montarCupomEstabelecimento(printer, dados) {
  const { pedido, itens } = dados;

  printer.alignCenter();
  printer.bold(true);
  printer.println('NEXOGEST - VIA ESTABELECIMENTO');
  printer.bold(false);
  printer.drawLine();

  printer.alignLeft();
  printer.leftRight(`Pedido #${pedido.id}`, formatarDataHora(pedido.data_pedido));
  printer.println(`Canal: ${pedido.canal_venda || '-'}`);
  printer.println(`Cliente: ${pedido.cliente_nome || '-'}`);
  printer.println(`Telefone: ${pedido.cliente_telefone || '-'}`);
  if (pedido.cliente_endereco) {
    printer.println(`Endereco: ${pedido.cliente_endereco}`);
  }
  printer.drawLine();

  itens.forEach((item) => {
    const qtd = parseFloat(item.quantidade);
    const subtotal = (qtd * parseFloat(item.preco_unitario)).toFixed(2);
    printer.leftRight(`${qtd}x ${item.produto_nome}`, `R$ ${subtotal}`);
  });
  printer.drawLine();

  if (pedido.observacoes && pedido.observacoes.trim()) {
    printer.bold(true);
    printer.println('*** OBSERVACOES ***');
    printer.println(pedido.observacoes.toUpperCase());
    printer.bold(false);
    printer.drawLine();
  }

  printer.leftRight('Pagamento:', pedido.forma_pagamento || '-');
  printer.bold(true);
  printer.leftRight('TOTAL', `R$ ${parseFloat(pedido.total).toFixed(2)}`);
  printer.bold(false);
  printer.println(`Vendedor: ${pedido.usuario_nome || '-'}`);
  printer.newLine();
  printer.cut();
}

// Via que acompanha o produto: visual limpo, sem jargao interno.
function montarCupomCliente(printer, dados) {
  const { pedido, itens } = dados;

  printer.alignCenter();
  printer.bold(true);
  printer.println('NexoGest');
  printer.bold(false);
  printer.println(formatarDataHora(pedido.data_pedido));
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Pedido #${pedido.id}`);
  printer.drawLine();

  itens.forEach((item) => {
    const qtd = parseFloat(item.quantidade);
    const subtotal = (qtd * parseFloat(item.preco_unitario)).toFixed(2);
    printer.leftRight(`${qtd}x ${item.produto_nome}`, `R$ ${subtotal}`);
  });
  printer.drawLine();

  printer.bold(true);
  printer.leftRight('TOTAL', `R$ ${parseFloat(pedido.total).toFixed(2)}`);
  printer.bold(false);
  printer.println(`Pagamento: ${pedido.forma_pagamento || '-'}`);
  printer.newLine();
  printer.alignCenter();
  printer.println('Obrigado pela preferencia!');
  printer.newLine();
  printer.cut();
}

async function enviarParaImpressora(printer) {
  if (!process.env.PRINTER_INTERFACE) {
    const erro = new Error('Impressora não configurada. Defina PRINTER_INTERFACE no .env do backend (ex: tcp://IP:9100, ou printer:NomeDaImpressora).');
    erro.impressoraNaoConfigurada = true;
    throw erro;
  }
  await printer.execute();
}

module.exports = {
  buscarDadosPedido,
  criarImpressora,
  montarCupomEstabelecimento,
  montarCupomCliente,
  enviarParaImpressora
};
