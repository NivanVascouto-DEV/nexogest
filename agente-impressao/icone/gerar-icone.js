// Gera icone.ico a partir de logo.svg (varias resolucoes, para boa legibilidade
// tanto no Explorador de Arquivos quanto em icones pequenos tipo 16x16/32x32).
// Rodar com: node icone/gerar-icone.js
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const fs = require('fs');

const TAMANHOS = [16, 24, 32, 48, 64, 128, 256];
const svgPath = path.join(__dirname, 'logo.svg');
const icoPath = path.join(__dirname, 'icone.ico');

async function gerar() {
  const buffersPng = [];

  for (const tamanho of TAMANHOS) {
    const buffer = await sharp(svgPath, { density: 384 })
      .resize(tamanho, tamanho)
      .png()
      .toBuffer();
    buffersPng.push(buffer);
    console.log(`Gerado PNG ${tamanho}x${tamanho} (${buffer.length} bytes)`);
  }

  const icoBuffer = await pngToIco(buffersPng);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`icone.ico gerado em ${icoPath} (${icoBuffer.length} bytes)`);
}

gerar().catch((erro) => {
  console.error('Erro ao gerar o icone:', erro);
  process.exit(1);
});
