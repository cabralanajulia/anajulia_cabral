// ============================================================
// routes/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊS (ALUNO DESENVOLVE).
//
// A estrutura de cada rota (o "molde" com try/catch/finally e a
// conexão com o banco) já está pronta, seguindo o mesmo padrão
// usado em routes/auth.js. O que falta em cada uma é a lógica
// específica (marcada com TODO).
//
// Lembretes importantes:
//   - Cada rota abaixo já vem protegida pelo middleware
//     verificarSessao (segundo parâmetro) - vocês não precisam
//     mexer nisso, só saber que é por isso que o sistema exige
//     login para usar essas rotas.
//   - O CPF do tutor deve ser CRIPTOGRAFADO ao salvar/atualizar, e
//     DESCRIPTOGRAFADO ao listar/exibir - use as funções prontas em
//     utils/crypto-utils.js (criptografarCPF / descriptografarCPF)
//
// Veja o GUIA_DE_DESENVOLVIMENTO.md para um roteiro passo a passo
// de cada uma dessas funcionalidades.
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { criptografarCPF, descriptografarCPF } from '../utils/crypto-utils.js';
import { verificarSessao } from '../middleware/auth-middleware.js';

const router = express.Router();

// ─────────────────────────────────────────
// GET -> Listar tutores e Busca por nome
// ─────────────────────────────────────────
router.get('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { busca } = req.query;
        let resultado;

        if (busca && busca.trim() !== '') {
            // Busca filtrada pelo nome
            resultado = await client.query(
                'SELECT * FROM tutores WHERE LOWER(nome) LIKE LOWER($1) ORDER BY id ASC',
                [`%${busca.trim()}%`]
            );
        } else {
            // Listagem completa
            resultado = await client.query('SELECT * FROM tutores ORDER BY id ASC');
        }

        // Descriptografa o CPF de cada tutor antes de retornar ao front-end
        const tutoresTratados = resultado.rows.map((tutor) => ({
            ...tutor,
            cpf: descriptografarCPF(tutor.cpf)
        }));

        res.json(tutoresTratados);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// POST -> Inserir novo tutor
// ─────────────────────────────────────────
router.post('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        const { nome, cpf, telefone } = req.body;

        if (!nome || !cpf) {
            return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
        }

        await client.connect();

        // Criptografa o CPF antes de salvar na base de dados
        const cpfCriptografado = criptografarCPF(cpf);

        const resultado = await client.query(
            'INSERT INTO tutores (nome, cpf, telefone) VALUES ($1, $2, $3) RETURNING *',
            [nome, cpfCriptografado, telefone || null]
        );

        const tutorCriado = resultado.rows[0];
        tutorCriado.cpf = descriptografarCPF(tutorCriado.cpf);

        res.status(201).json(tutorCriado);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ───────────────────────────────────
// PUT:id -> Editar tutor existente
// ───────────────────────────────────
router.put('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        const { id } = req.params;
        const { nome, cpf, telefone } = req.body;

        if (!nome || !cpf) {
            return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
        }

        await client.connect();

        // Criptografa o CPF antes de atualizar
        const cpfCriptografado = criptografarCPF(cpf);

        const resultado = await client.query(
            'UPDATE tutores SET nome = $1, cpf = $2, telefone = $3 WHERE id = $4 RETURNING *',
            [nome, cpfCriptografado, telefone || null, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        const tutorAtualizado = resultado.rows[0];
        tutorAtualizado.cpf = descriptografarCPF(tutorAtualizado.cpf);

        res.json(tutorAtualizado);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ──────────────────────────────
// DELETE:id -> Excluir tutor
// ──────────────────────────────
router.delete('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        const { id } = req.params;

        await client.connect();

        const resultado = await client.query('DELETE FROM tutores WHERE id = $1', [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json({ mensagem: 'Tutor removido com sucesso.' });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

export default router;