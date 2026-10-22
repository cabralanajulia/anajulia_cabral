// ============================================================
// routes/auth.js
// ============================================================
// Este arquivo já está pronto (BASE FORNECIDA).
//
// Aqui está toda a lógica de login: recebe usuário e senha,
// confere no banco, e cria a sessão do usuário autenticado.
//
// Vocês não precisam alterar esta rota para o sistema funcionar.
// O que vocês vão desenvolver, usando o que está pronto aqui, é:
//   - exibir o nome do usuário logado na tela Principal (RF-09)
//   - implementar o logout (RF-10)
//   (ambos em public/js/principal.js)
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { compararSenha } from '../utils/crypto-utils.js';

const router = express.Router();

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ erro: 'Informe usuário e senha.' });
    }

    const client = criarCliente();
    try {
        await client.connect();

        const resultado = await client.query(
            'SELECT * FROM usuarios WHERE login = $1',
            [login]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
        }

        const usuario = resultado.rows[0];
        const senhaConfere = await compararSenha(senha, usuario.senha);

        if (!senhaConfere) {
            return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
        }

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            login: usuario.login
        };

        res.json({ mensagem: 'Login realizado com sucesso.', nome: usuario.nome });

    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// GET /api/auth/sessao
// ─────────────────────────────────────────
router.get('/sessao', (req, res) => {
    if (req.session && req.session.usuario) {
        return res.json({ usuario: req.session.usuario });
    }
    return res.status(401).json({ erro: 'Sessão expirada ou usuário não autenticado.' });
});

// ─────────────────────────────────────────
// POST /api/auth/logout (RF-10)
// ─────────────────────────────────────────
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao encerrar a sessão.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ mensagem: 'Sessão encerrada com sucesso.' });
    });
});

export default router;