const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    try {
        const { login, senha } = req.body;

        const resultado = await pool.query('SELECT * FROM usuarios WHERE login = $1', [login]);
        const usuario = resultado.rows[0];

        if (!usuario) {
            return res.status(401).json({ mensagem: 'Usuário ou senha inválidos' });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Usuário ou senha inválidos' });
        }

           const token = jwt.sign(
            { id: usuario.id, papel: usuario.papel },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({token, nome: usuario.nome, papel: usuario.papel })

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro ao fazer login' });
    }
});

module.exports = router;