# Agente de Impressão — NexoGest

Programa Node.js independente que roda na máquina Windows onde a impressora
térmica está fisicamente conectada. Ele se conecta ao backend do NexoGest
(local ou já publicado na nuvem) via Socket.io e, sempre que alguém clicar em
"Imprimir cozinha" ou "Imprimir cliente" no sistema, recebe os dados do pedido
e imprime o cupom na hora.

Isso existe porque o backend, quando publicado num serviço como o Render, roda
em um servidor Linux na nuvem — sem acesso a impressoras USB/locais. Este
agente é a ponte: fica rodando no computador da loja, com acesso real à
impressora, e só ele precisa saber qual é a impressora configurada
(`PRINTER_INTERFACE`).

## Pré-requisitos

- Windows (o envio para impressoras locais usa `winspool.drv` via PowerShell)
- [Node.js](https://nodejs.org/) instalado (versão 18 ou mais recente)
- A impressora térmica já instalada e visível em **Impressoras e Scanners**
  do Windows (ou acessível via rede, se for uma impressora de rede)

## Instalação

1. Copie a pasta `agente-impressao/` para o computador que tem a impressora
   conectada (pode ser via git clone do projeto inteiro, ou só copiando essa
   pasta).
2. Abra um terminal dentro da pasta `agente-impressao/` e instale as
   dependências:

   ```
   npm install
   ```

3. Copie o arquivo de exemplo e preencha com os valores reais:

   ```
   copy .env.example .env
   ```

   Edite o `.env` criado:

   ```
   BACKEND_URL=https://seu-backend.onrender.com
   PRINTER_INTERFACE=printer:NOME EXATO DA IMPRESSORA
   ```

   - `BACKEND_URL`: endereço do backend já publicado (ou `http://localhost:3000`
     se estiver testando tudo na mesma rede local, antes do deploy).
   - `PRINTER_INTERFACE`: mesma variável de sempre —
     - `printer:Nome Exato` para impressora instalada localmente no Windows
       (o nome deve ser **idêntico** ao que aparece em "Impressoras e
       Scanners", incluindo maiúsculas/acentos)
     - `tcp://IP:PORTA` para impressora de rede (ex: `tcp://192.168.0.50:9100`)

## Rodando

```
npm start
```

Se tudo estiver certo, o terminal mostra:

```
[agente-impressao] Iniciando... aguardando conexão com o backend.
[agente-impressao] Conectado ao backend em https://seu-backend.onrender.com
```

O agente também abre automaticamente o navegador padrão na tela de login do
NexoGest assim que inicia.

Deixe essa janela aberta (minimizada) enquanto a loja estiver funcionando. Se
a internet cair, o agente reconecta sozinho assim que a conexão voltar — não
precisa reiniciar nada manualmente.

## Gerando o executável (.exe)

Para distribuir este agente para computadores que não têm Node.js instalado,
é possível empacotar tudo (incluindo o próprio Node.js) num único `.exe`
standalone, usando o [`pkg`](https://github.com/yao-pkg/pkg):

```
npm install
npm run build
```

Isso gera `dist/NexoGest.exe` (arquivo grande, ~60MB, porque leva o Node.js
embutido — por isso ele **não é commitado no repositório**, só o script de
build). Depois de gerado, para distribuir numa máquina nova, copie para lá:

- `dist/NexoGest.exe`
- `.env.example` (a pessoa renomeia para `.env` e preenche a impressora)

O arquivo `LEIA-ME.txt` (na raiz desta pasta) tem instruções em português,
para quem for instalar sem precisar entender nada de programação — pode ser
copiado junto com o `.exe`.

O `.env` é lido **de dentro da pasta onde o `.exe` está**, não de dentro do
pacote — ou seja, cada computador pode ter sua própria impressora configurada
sem precisar gerar um `.exe` diferente para cada um.

Para abrir o navegador automaticamente ao iniciar, o agente usa o pacote
[`open`](https://www.npmjs.com/package/open) em vez de chamar `start` do
Windows diretamente via `child_process.exec` — testamos e confirmamos que,
dentro de um `.exe` empacotado pelo pkg, `exec('start "" "URL"')` pode
reportar sucesso sem realmente abrir nada visível; `open` usa outro
mecanismo (PowerShell `Start-Process`) que funciona corretamente também no
binário compilado. Se por algum motivo o navegador não abrir sozinho numa
máquina específica, o agente imprime no console a URL para abrir manualmente.

### Sobre o ícone do executável

Existe um ícone personalizado pronto em `icone/icone.ico` (gerado a partir de
`icone/logo.svg`, a mesma logo usada na barra lateral do sistema — rode
`node icone/gerar-icone.js` para regenerar o `.ico` se o design mudar).

Ainda **não conseguimos embuti-lo no `.exe`** de forma confiável: tanto
`rcedit` quanto `resedit` (nas duas ordens possíveis — antes ou depois do
`pkg` empacotar) acabam corrompendo ou deslocando o payload que o pkg anexa
ao binário base do Node, porque o pkg localiza esse payload por uma posição
absoluta gravada dentro do próprio binário, e qualquer reescrita da seção de
recursos do Windows desloca essa posição. O `.exe` gerado hoje funciona
perfeitamente, só usa o ícone padrão do Node/pkg em vez do ícone da
NexoGest. Se alguém quiser retomar isso, o caminho mais promissor não
tentado ainda é usar o recurso `--sea` (Single Executable Application) do
próprio Node.js junto com a ferramenta oficial `postject`, que foi desenhada
especificamente para esse tipo de injeção sem quebrar o binário.

## Iniciar automaticamente com o Windows (opcional)

A forma mais simples, sem precisar de instalador, é usar o **Agendador de
Tarefas** do Windows:

1. Abra o **Agendador de Tarefas** (pesquise "Agendador de Tarefas" no menu
   Iniciar).
2. Clique em **Criar Tarefa Básica...**
3. Nome: `NexoGest - Agente de Impressão`.
4. Disparador: **Ao fazer logon**.
5. Ação: **Iniciar um programa**.
   - Programa/script: `node`
   - Argumentos: `index.js`
   - Iniciar em (pasta): o caminho completo da pasta `agente-impressao`
     (ex: `C:\NexoGest\agente-impressao`)
6. Finalize o assistente. Na aba **Condições** da tarefa criada, desmarque
   "Iniciar a tarefa somente se o computador estiver com energia AC" caso o
   computador seja um notebook.

A partir daí, o agente inicia sozinho toda vez que o Windows ligar, sem
precisar abrir terminal manualmente.

## Como saber se está funcionando

Com o agente rodando e conectado, qualquer clique em "Imprimir cozinha" ou
"Imprimir cliente" no sistema deve imprimir o cupom em poucos segundos. Se
aparecer "Nenhum agente de impressão conectado no momento." na tela, é sinal
de que este agente não está rodando ou não conseguiu se conectar ao
`BACKEND_URL` configurado — confira o terminal do agente para ver a mensagem
de erro exata.
