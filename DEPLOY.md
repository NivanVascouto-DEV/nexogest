# Deploy do NexoGest

Este guia cobre como publicar o backend no Render, o frontend na Netlify, e
como configurar o agente de impressão local na máquina da loja.

## 1. Backend no Render

1. Crie uma conta no [Render](https://render.com) (ou entre na existente) e
   conecte o repositório do GitHub deste projeto.
2. Crie um novo **Web Service** apontando para a pasta `backend/`:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Runtime**: Node
3. Em **Environment**, adicione as variáveis (veja `backend/.env.example`
   para a lista completa):
   - `DATABASE_URL` — string de conexão do Postgres (Neon, ou o banco de
     dados que você já usa)
   - `JWT_SECRET` — qualquer string longa e aleatória, usada para assinar os
     tokens de login
   - `FRONTEND_URL` — a URL do frontend publicado na Netlify (ex:
     `https://nexogest.netlify.app`), usada para restringir o CORS. Se essa
     variável não for definida, o backend libera qualquer origem — o que é
     útil durante testes, mas não deve ficar assim em produção.
   - **Não é preciso definir `PRINTER_INTERFACE`** no Render — essa variável
     agora só existe no `.env` do agente de impressão local (veja a seção 3).
4. Depois do primeiro deploy, o Render mostra a URL pública do serviço (algo
   como `https://nexogest-backend.onrender.com`). Guarde essa URL — ela é
   necessária nos passos 2 e 3 abaixo.
5. Planos gratuitos do Render "dormem" depois de um tempo sem uso e demoram
   alguns segundos para acordar na primeira requisição — normal, não é erro.

## 2. Frontend na Netlify

1. Crie uma conta na [Netlify](https://netlify.com) e conecte o mesmo
   repositório do GitHub.
2. Ao criar o site, configure:
   - **Base directory**: `frontend`
   - **Build command**: (deixe em branco — é HTML/CSS/JS puro, sem etapa de
     build)
   - **Publish directory**: `frontend` (ou `.` se o "Base directory" já
     estiver configurado como `frontend`)
3. Não é necessário configurar nenhuma variável de ambiente na Netlify — o
   frontend não roda nenhum processo de build que leia variáveis; a URL do
   backend é lida diretamente de `frontend/js/config.js`.
4. **Importante**: antes (ou depois) de publicar, abra
   `frontend/js/config.js` e troque o valor de `API_URL` pela URL real do
   backend que o Render gerou no passo 1 (ex:
   `https://nexogest-backend.onrender.com`), depois faça commit e push dessa
   mudança — a Netlify republica automaticamente a cada push.
5. Depois de publicado, a Netlify te dá uma URL (ex:
   `https://nexogest.netlify.app`). Volte no Render e confirme que a
   variável `FRONTEND_URL` do backend está com essa URL exata.

## 3. Agente de impressão local

O agente de impressão (`agente-impressao/`) precisa rodar num computador
Windows real, com a impressora térmica conectada — ele **não** vai para o
Render nem para a Netlify, fica na máquina da loja.

1. Copie a pasta `agente-impressao/` (ou o repositório inteiro) para o
   computador da loja.
2. Dentro da pasta, rode `npm install`.
3. Copie `.env.example` para `.env` e preencha:

   ```
   BACKEND_URL=https://nexogest-backend.onrender.com
   PRINTER_INTERFACE=printer:NOME EXATO DA IMPRESSORA
   ```

   Use a mesma URL do backend publicado no Render (passo 1).
4. Rode `npm start`. O terminal deve mostrar que conectou ao backend.
5. (Opcional, recomendado) Configure para iniciar sozinho com o Windows —
   instruções detalhadas em `agente-impressao/README.md`.

## 4. Lembrete final

Depois que o backend estiver publicado e você souber a URL real gerada pelo
Render:

- [ ] Atualize `API_URL` em `frontend/js/config.js` com essa URL e faça
      commit/push (a Netlify republica sozinha).
- [ ] Atualize `FRONTEND_URL` nas variáveis de ambiente do Render com a URL
      real da Netlify.
- [ ] Atualize `BACKEND_URL` no `.env` do agente de impressão com a mesma URL
      do Render.

Esses três valores formam um triângulo — se um deles ficar apontando para o
endereço errado (ou para `localhost`), a parte correspondente do sistema para
de funcionar em produção.
