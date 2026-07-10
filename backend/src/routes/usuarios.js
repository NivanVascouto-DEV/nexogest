const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id, nome, login, papel, criado_em FROM usuarios');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao buscar usuários' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, login, senha, papel } = req.body;
        const senha_hash = await bcrypt.hash(senha, 10);
        const resultado = await pool.query(
            'INSERT INTO usuarios (nome, login, senha_hash, papel) VALUES ($1, $2, $3, $4) RETURNING id, nome, login, papel',
            [nome, login, senha_hash, papel]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao criar usuário' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, login, senha, papel } = req.body;
        const senha_hash = await bcrypt.hash(senha, 10);
        const resultado = await pool.query(
            'UPDATE usuarios SET nome = $1, login = $2, senha_hash = $3, papel = $4 WHERE id = $5 RETURNING id, nome, login, papel',
            [nome, login, senha_hash, papel, id]
        );
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao atualizar usuário' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ mensagem: 'Usuário excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao excluir usuário' });
    }
});

module.exports = router;