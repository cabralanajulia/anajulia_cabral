// ============================================================
// public/js/principal.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// O que falta aqui:
//   - RF-09: recuperar o nome do usuário autenticado e exibir
//     no elemento #nome-usuario
//   - RF-10: implementar o logout no botão #btn-sair
//
// A navegação para Tutores, Pets e Agendamentos (RF-11) já está
// pronta no HTML (são apenas links <a>), vocês não precisam
// mexer nisso.
// ============================================================

// ============================================================
// public/js/principal.js
// ============================================================

// ============================================================
// public/js/principal.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const nomeUsuarioEl = document.getElementById('nome-usuario');
    const btnSair = document.getElementById('btn-sair');

    // Carrega o nome do usuário logado
    carregarUsuarioLogado();

    // Configura o clique no botão de Sair
    if (btnSair) {
        btnSair.addEventListener('click', async (evento) => {
            evento.preventDefault();

            try {
                const resposta = await fetch('/api/auth/logout', {
                    method: 'POST'
                });

                if (resposta.ok) {
                    window.location.href = '/login.html';
                } else {
                    alert('Erro ao encerrar a sessão. Tente novamente.');
                }
            } catch (erro) {
                console.error('Erro ao fazer logout:', erro);
            }
        });
    }

    async function carregarUsuarioLogado() {
        try {
            const resposta = await fetch('/api/auth/sessao');

            if (resposta.status === 401) {
                window.location.href = '/login.html';
                return;
            }

            const dados = await resposta.json();

            if (nomeUsuarioEl && dados.usuario) {
                nomeUsuarioEl.textContent = dados.usuario.nome;
            }
        } catch (erro) {
            console.error('Erro ao verificar sessão:', erro);
        }
    }
});