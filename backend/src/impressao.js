const { printer: ThermalPrinter, types: PrinterTypes, characterSet: CharacterSet } = require('node-thermal-printer');
const pool = require('./db');
const { enviarBufferParaImpressoraWindows, testarConexaoImpressoraWindows } = require('./impressoraWindows');

// PRINTER_INTERFACE no .env do backend aceita dois formatos:
//   tcp://IP:PORTA           -> impressora de rede (ex: tcp://192.168.0.50:9100)
//   printer:Nome Exato       -> impressora instalada localmente no Windows,
//                                 nome EXATO como aparece em "Impressoras e Scanners"
//                                 (ex: printer:IMPRESSORA DE NF-e)
// O formato "printer:" NAO usa a biblioteca node-thermal-printer para o envio
// (ela exige um driver nativo adicional que se mostrou pouco confiavel); em vez
// disso os bytes RAW sao enviados via winspool.drv (ver impressoraWindows.js).

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
  const configurado = process.env.PRINTER_INTERFACE || '';
  // So passamos o valor real para o node-thermal-printer quando ele sabe lidar
  // nativamente (tcp://). Para "printer:" o envio e feito por nos mesmos (ver
  // enviarParaImpressora), entao aqui basta uma interface inofensiva so para
  // permitir montar o cupom (println/leftRight/etc so usam o buffer em memoria).
  const interfaceConstrutor = configurado.startsWith('tcp://') ? configurado : 'file:nao-usado';

  return new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: interfaceConstrutor,
    width: charWidth,
    removeSpecialCharacters: false,
    characterSet: CharacterSet.PC860_PORTUGUESE
  });
}

// Via interna, para quem prepara o pedido: so o essencial para montar o pedido.
function montarCupomEstabelecimento(printer, dados) {
  const { pedido, itens } = dados;

  printer.alignCenter();
  printer.bold(true);
  printer.println('DELICIAS DA MARY');
  printer.println('VIA COZINHA');
  printer.bold(false);
  printer.drawLine();

  printer.alignLeft();
  printer.leftRight(`Pedido #${pedido.id}`, formatarDataHora(pedido.data_pedido));
  printer.println(`Cliente: ${pedido.cliente_nome || '-'}`);
  printer.drawLine();

  itens.forEach((item) => {
    const qtd = parseFloat(item.quantidade);
    printer.println(`${qtd}x ${item.produto_nome}`);
  });
  printer.drawLine();

  if (pedido.observacoes && pedido.observacoes.trim()) {
    printer.bold(true);
    printer.println('*** OBSERVACOES ***');
    printer.println(pedido.observacoes.toUpperCase());
    printer.bold(false);
  }

  printer.newLine();
  printer.cut();
}

// Via que acompanha o produto: visual limpo, sem jargao interno.
function montarCupomCliente(printer, dados) {
  const { pedido, itens } = dados;

  printer.alignCenter();
  printer.bold(true);
  printer.println('DELICIAS DA MARY');
  printer.bold(false);
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Cliente: ${pedido.cliente_nome || '-'}`);
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

  printer.bold(true);
  printer.leftRight('TOTAL', `R$ ${parseFloat(pedido.total).toFixed(2)}`);
  printer.bold(false);
  printer.println(`Pagamento: ${pedido.forma_pagamento || '-'}`);

  if (pedido.forma_pagamento === 'dinheiro' && pedido.valor_recebido !== null && pedido.valor_recebido !== undefined) {
    const troco = parseFloat(pedido.valor_recebido) - parseFloat(pedido.total);
    printer.leftRight('Troco', `R$ ${troco.toFixed(2)}`);
  }

  printer.newLine();
  printer.cut();
}

function mensagemNaoConfigurada() {
  return 'Impressora não configurada. Defina PRINTER_INTERFACE no .env do backend: '
    + 'tcp://IP:PORTA para impressora de rede (ex: tcp://192.168.0.50:9100), ou '
    + 'printer:Nome Exato para impressora instalada localmente no Windows '
    + '(ex: printer:IMPRESSORA DE NF-e, exatamente como aparece em Impressoras e Scanners).';
}

async function enviarParaImpressora(printer) {
  const configurado = process.env.PRINTER_INTERFACE;

  if (!configurado) {
    const erro = new Error(mensagemNaoConfigurada());
    erro.impressoraNaoConfigurada = true;
    throw erro;
  }

  if (configurado.startsWith('printer:')) {
    const nomeImpressora = configurado.slice('printer:'.length);
    await enviarBufferParaImpressoraWindows(nomeImpressora, printer.getBuffer());
    return;
  }

  if (configurado.startsWith('tcp://')) {
    await printer.execute();
    return;
  }

  const erro = new Error(`Formato de PRINTER_INTERFACE não reconhecido: "${configurado}". ` + mensagemNaoConfigurada());
  erro.impressoraNaoConfigurada = true;
  throw erro;
}

// Usado pela rota de diagnostico GET /impressora/testar - so verifica se a
// impressora configurada responde, sem imprimir nada em papel.
async function testarImpressora() {
  const configurado = process.env.PRINTER_INTERFACE;

  if (!configurado) {
    const erro = new Error(mensagemNaoConfigurada());
    erro.impressoraNaoConfigurada = true;
    throw erro;
  }

  if (configurado.startsWith('printer:')) {
    const nomeImpressora = configurado.slice('printer:'.length);
    await testarConexaoImpressoraWindows(nomeImpressora);
    return { tipo: 'printer', nome: nomeImpressora };
  }

  if (configurado.startsWith('tcp://')) {
    const semProtocolo = configurado.replace('tcp://', '');
    const [host, portaStr] = semProtocolo.split(':');
    const porta = parseInt(portaStr, 10) || 9100;
    await testarConexaoTcp(host, porta);
    return { tipo: 'tcp', host, porta };
  }

  const erro = new Error(`Formato de PRINTER_INTERFACE não reconhecido: "${configurado}". ` + mensagemNaoConfigurada());
  erro.impressoraNaoConfigurada = true;
  throw erro;
}

function testarConexaoTcp(host, porta) {
  const net = require('net');
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port: porta, timeout: 4000 });
    socket.on('connect', () => {
      socket.destroy();
      resolve();
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`Tempo esgotado ao conectar em ${host}:${porta}.`));
    });
    socket.on('error', (erro) => {
      reject(new Error(`Não foi possível conectar em ${host}:${porta}: ${erro.message}`));
    });
  });
}

module.exports = {
  buscarDadosPedido,
  criarImpressora,
  montarCupomEstabelecimento,
  montarCupomCliente,
  enviarParaImpressora,
  testarImpressora
};
