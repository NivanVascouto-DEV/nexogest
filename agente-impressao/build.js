// Gera o executavel Windows standalone (dist/NexoGest.exe).
// Rodar com: npm run build
//
// NOTA sobre o icone: tentamos embutir o icone personalizado (icone/icone.ico)
// no .exe gerado, usando rcedit e tambem resedit, nas duas ordens possiveis
// (antes e depois do empacotamento pelo pkg). Em todos os casos testados, a
// ferramenta de edicao de recursos do Windows acaba corrompendo ou deslocando
// o payload que o pkg anexa ao binario base do Node (a "virtual filesystem"
// com o codigo da aplicacao) - o .exe resultante deixa de conseguir ler seus
// proprios arquivos internos. Isso acontece porque o pkg usa placeholders de
// texto embutidos no binario base para localizar esse payload por posicao
// absoluta, e qualquer reescrita da secao de recursos do PE desloca essas
// posicoes. Ate resolvermos isso de forma segura, o executavel usa o icone
// padrao do Node/pkg. Os arquivos em icone/ (logo.svg, icone.ico,
// gerar-icone.js) ficam prontos para quando isso for resolvido.
const path = require('path');
const { execSync } = require('child_process');

const SAIDA = path.join(__dirname, 'dist', 'NexoGest.exe');

console.log('Empacotando com pkg...');
execSync(`pkg . --targets node22-win-x64 --output "${SAIDA}"`, {
  cwd: __dirname,
  stdio: 'inherit'
});

console.log(`Pronto: ${SAIDA}`);
