// ============================================================
// public/js/agendamentos.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// Requisitos envolvidos: RF-19 (listar ordenado, com dados de
// tutor e pet) e RF-20 (atualizar data de um agendamento).
//
// Sugestão de estrutura por linha da tabela: cada linha mostra
// os dados do agendamento, e na coluna "Ações" um campo de data
// (input type="date", já preenchido com a data atual do
// agendamento) mais um botão "Salvar" - ao clicar, atualiza
// aquele agendamento. Isso evita precisar de modal/popup.
//
// EXEMPLOS DE APOIO (pasta exemplos/):
//   - exemplo-montar-tela.js : desenhar a tabela e formatar datas
//   - exemplo-fetch.js       : GET, PUT e os demais tipos de fetch
// ============================================================

const corpoTabela = document.getElementById('corpo-tabela-agendamentos');
const tabela = document.getElementById('tabela-agendamentos');
const mensagemAgendamentos = document.getElementById('mensagem-agendamentos');

inicializar();

async function inicializar() {
    await carregarAgendamentos();
}

// ------------------------------------------------------------
// RF-19: Listar agendamentos ordenados por data
// ------------------------------------------------------------
async function carregarAgendamentos() {
    try {
        const resposta = await fetch('/api/agendamentos');

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const agendamentos = await resposta.json();
        renderizarAgendamentos(agendamentos);
    } catch (erro) {
        mensagemAgendamentos.textContent = 'Erro ao carregar agendamentos.';
        mensagemAgendamentos.classList.remove('d-none');
        tabela.classList.add('d-none');
        console.error(erro);
    }
}

function formatarDataParaInput(dataIso) {
    if (!dataIso) return '';
    const d = new Date(dataIso);
    if (isNaN(d.getTime())) return String(dataIso).substring(0, 10);
    return d.toISOString().split('T')[0];
}

function formatarDataExibicao(dataIso) {
    if (!dataIso) return '-';
    const d = new Date(dataIso);
    if (isNaN(d.getTime())) return dataIso;
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function renderizarAgendamentos(agendamentos) {
    if (!agendamentos || agendamentos.length === 0) {
        mensagemAgendamentos.textContent = 'Nenhum agendamento encontrado.';
        mensagemAgendamentos.classList.remove('d-none');
        tabela.classList.add('d-none');
        corpoTabela.innerHTML = '';
        return;
    }

    mensagemAgendamentos.classList.add('d-none');
    tabela.classList.remove('d-none');
    corpoTabela.innerHTML = '';

    agendamentos.forEach((agendamento) => {
        const tr = document.createElement('tr');
        const dataFormatadaInput = formatarDataParaInput(agendamento.data_agendamento);
        const dataFormatadaTexto = formatarDataExibicao(agendamento.data_agendamento);

        tr.innerHTML = `
            <td>${dataFormatadaTexto}</td>
            <td>${agendamento.pet_nome || '-'}</td>
            <td>${agendamento.pet_especie || '-'}</td>
            <td>${agendamento.tutor_nome || '-'}</td>
            <td>${agendamento.tutor_telefone || '-'}</td>
            <td>${agendamento.observacoes || '-'}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input type="date" class="form-control form-control-sm input-nova-data" value="${dataFormatadaInput}">
                    <button class="btn btn-sm btn-primary btn-salvar">Salvar</button>
                </div>
            </td>
        `;

        const btnSalvar = tr.querySelector('.btn-salvar');
        const inputData = tr.querySelector('.input-nova-data');

        btnSalvar.addEventListener('click', async () => {
            const novaData = inputData.value;
            if (!novaData) {
                alert('Por favor, informe uma data válida.');
                return;
            }
            await atualizarDataAgendamento(agendamento.id, novaData);
        });

        corpoTabela.appendChild(tr);
    });
}

// ------------------------------------------------------------
// RF-20: Atualizar a data de um agendamento
// ------------------------------------------------------------
async function atualizarDataAgendamento(id, novaData) {
    try {
        const resposta = await fetch(`/api/agendamentos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data_agendamento: novaData })
        });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (resposta.ok) {
            alert('Data do agendamento atualizada com sucesso!');
            await carregarAgendamentos();
        } else {
            const erroData = await resposta.json();
            alert(erroData.erro || 'Erro ao atualizar data do agendamento.');
        }
    } catch (erro) {
        alert('Erro ao atualizar data do agendamento.');
        console.error(erro);
    }
}