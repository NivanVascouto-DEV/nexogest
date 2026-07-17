-- NexoGest - Schema do banco de dados
-- Fuso horário: America/Sao_Paulo (Brasília)

SET TIMEZONE = 'America/Sao_Paulo';

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    telefone TEXT,
    endereco TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
	id SERIAL PRIMARY KEY,
	nome TEXT,
	login TEXT,
	senha_hash TEXT,
	papel TEXT,
	criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE produtos (
	id SERIAL PRIMARY KEY,
	codigo INTEGER,
	nome TEXT,
	preco NUMERIC(10,2),
	canal_venda TEXT,
	unidade_venda TEXT,
	controla_estoque BOOLEAN,
	quantidade_estoque NUMERIC(10,2),
	imagem TEXT,
	criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pedidos (
	id SERIAL PRIMARY KEY,
	cliente_id INTEGER REFERENCES clientes(id),
	usuario_id INTEGER REFERENCES usuarios(id),
	canal_venda TEXT,
	status TEXT,
	forma_pagamento TEXT,
	total NUMERIC(10,2),
	observacoes TEXT,
	data_pedido TIMESTAMP DEFAULT NOW()
);

CREATE TABLE itens_pedido (
	id SERIAL PRIMARY KEY,
	pedido_id INTEGER REFERENCES pedidos(id),
	produto_id INTEGER REFERENCES produtos(id),
	quantidade NUMERIC(10,3),
	preco_unitario NUMERIC(10,2)
);

ALTER TABLE usuarios ADD CONSTRAINT usuarios_login_unique UNIQUE (login);
ALTER TABLE produtos ADD CONSTRAINT produtos_codigo_unique UNIQUE (codigo);

-- Módulo financeiro (calculadora de markup + lançamentos)

CREATE TABLE insumos (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    unidade_medida TEXT,
    custo_por_unidade NUMERIC(10,2),
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ficha_tecnica (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER REFERENCES produtos(id),
    insumo_id INTEGER REFERENCES insumos(id),
    quantidade_usada NUMERIC(10,3)
);

CREATE TABLE lancamentos_financeiros (
    id SERIAL PRIMARY KEY,
    tipo TEXT,
    categoria TEXT,
    descricao TEXT,
    valor NUMERIC(10,2),
    forma_pagamento TEXT,
    data_lancamento TIMESTAMP DEFAULT NOW()
);

-- Exclusao logica (soft delete) de produtos e clientes: pedidos antigos que
-- referenciam essas linhas continuam funcionando (Historico), so somem das
-- listagens do dia a dia.
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Valor recebido em dinheiro no momento da venda, usado para calcular o
-- troco exibido na via de impressao do cliente.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS valor_recebido NUMERIC(10,2);

-- Status de pagamento de cada lancamento financeiro (despesas "pendente" ate
-- serem pagas). O saldo de caixa por forma de pagamento (GET /relatorios/
-- pagamentos) so desconta saidas com status 'paga'.
ALTER TABLE lancamentos_financeiros ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';