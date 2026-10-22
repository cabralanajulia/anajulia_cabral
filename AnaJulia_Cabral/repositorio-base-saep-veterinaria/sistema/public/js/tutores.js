// ============================================================
// public/js/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// A estrutura abaixo (elementos, eventos já conectados, nomes de
// função) já está pronta para vocês seguirem o mesmo padrão usado
// em outros projetos do curso (inicializar() no topo, funções
// carregarX() e renderizarX() separadas). O que falta é o conteúdo
// de cada função marcada com TODO.
//
// EXEMPLOS DE APOIO (pasta exemplos/):
//   - exemplo-montar-tela.js : desenhar a tabela, botões Editar e
//                              Excluir, levar os dados para o formulário
//   - exemplo-fetch.js       : todos os tipos de fetch (GET, busca,
//                              POST, PUT e DELETE)
//
// Requisitos envolvidos neste arquivo: RF-12, RF-13, RF-14, RF-15, RF-17
// ============================================================

const corpoTabela = document.getElementById('corpo-tabela-tutores');
const tabela = document.getElementById('tabela-tutores');
const mensagemTutores = document.getElementById('mensagem-tutores');

const inputBusca = document.getElementById('input-busca');
const btnBuscar = document.getElementById('btn-buscar');

const formTutor = document.getElementById('form-tutor');
const tutorIdInput = document.getElementById('tutor-id');
const tutorNomeInput = document.getElementById('tutor-nome');
const tutorCpfInput = document.getElementById('tutor-cpf');
const tutorTelefoneInput = document.getElementById('tutor-telefone');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');

inicializar();

async function inicializar() {
    await carregarTutores();
}

// ---------------------------
// Listar / Buscar Tutores
// ---------------------------s
async function carregarTutores(termoBusca = '') {
    try {
        const url = termoBusca
            ? `/api/tutores?busca=${encodeURIComponent(termoBusca)}`
            : '/api/tutores';

        const resposta = await fetch(url);

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const tutores = await resposta.json();
        renderizarTutores(tutores);
    } catch (erro) {
        mensagemTutores.textContent = 'Erro ao carregar tutores.';
        mensagemTutores.classList.remove('d-none');
        tabela.classList.add('d-none');
        console.error(erro);
    }
}

// ----------------------------------
// Renderiza a tabela no HTML
// ----------------------------------
function renderizarTutores(tutores) {
    if (!tutores || tutores.length === 0) {
        mensagemTutores.textContent = 'Nenhum tutor encontrado.';
        mensagemTutores.classList.remove('d-none');
        tabela.classList.add('d-none');
        corpoTabela.innerHTML = '';
        return;
    }

    mensagemTutores.classList.add('d-none');
    tabela.classList.remove('d-none');
    corpoTabela.innerHTML = '';

    tutores.forEach((tutor) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${tutor.nome}</td>
            <td>${tutor.cpf}</td>
            <td>${tutor.telefone || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-editar">Editar</button>
                <button class="btn btn-sm btn-danger btn-excluir">Excluir</button>
            </td>
        `;

        const btnEditar = tr.querySelector('.btn-editar');
        btnEditar.addEventListener('click', () => preencherFormularioParaEdicao(tutor));

        const btnExcluir = tr.querySelector('.btn-excluir');
        btnExcluir.addEventListener('click', () => excluirTutor(tutor.id));

        corpoTabela.appendChild(tr);
    });
}

// ------------------------------
// Evento de Busca
// ------------------------------
if (btnBuscar) {
    btnBuscar.addEventListener('click', () => {
        const termo = inputBusca.value.trim();
        carregarTutores(termo);
    });
}

if (inputBusca) {
    inputBusca.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const termo = inputBusca.value.trim();
            carregarTutores(termo);
        }
    });
}

// ----------------------------
// Salvar (Novo ou Edição)
// ----------------------------
formTutor.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const tutor = {
        nome: tutorNomeInput.value.trim(),
        cpf: tutorCpfInput.value.trim(),
        telefone: tutorTelefoneInput.value.trim()
    };

    const id = tutorIdInput.value;

    try {
        const url = id ? `/api/tutores/${id}` : '/api/tutores';
        const metodo = id ? 'PUT' : 'POST';

        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tutor)
        });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (resposta.ok) {
            formTutor.reset();
            tutorIdInput.value = '';
            btnCancelarEdicao.classList.add('d-none');
            await carregarTutores();
        } else {
            const erroData = await resposta.json();
            alert(erroData.erro || 'Erro ao salvar tutor.');
        }
    } catch (erro) {
        alert('Erro ao salvar tutor.');
        console.error(erro);
    }
});

btnCancelarEdicao.addEventListener('click', () => {
    formTutor.reset();
    tutorIdInput.value = '';
    btnCancelarEdicao.classList.add('d-none');
});

// --------------------------------------
// Preencher formulário para edição
// --------------------------------------
function preencherFormularioParaEdicao(tutor) {
    tutorIdInput.value = tutor.id;
    tutorNomeInput.value = tutor.nome;
    tutorCpfInput.value = tutor.cpf;
    tutorTelefoneInput.value = tutor.telefone || '';
    btnCancelarEdicao.classList.remove('d-none');
}

// ----------------------
// Excluir Tutor
// ----------------------
async function excluirTutor(id) {
    if (!confirm('Deseja realmente excluir este tutor?')) return;

    try {
        const resposta = await fetch(`/api/tutores/${id}`, {
            method: 'DELETE'
        });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (resposta.ok) {
            await carregarTutores();
        } else {
            const erroData = await resposta.json();
            alert(erroData.erro || 'Erro ao excluir tutor.');
        }
    } catch (erro) {
        alert('Erro ao excluir tutor.');
        console.error(erro);
    }
}