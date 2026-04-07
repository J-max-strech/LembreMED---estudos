/* =========================================================================
   controller.js - Ponte entre interface e IndexedDB
   ========================================================================= */

// --- ELEMENTOS DO HTML ---
const formRemedio = document.getElementById('form-remedio');
const mensagemSucessoRemedio = document.getElementById('mensagem-sucesso');
const listaHistorico = document.getElementById('lista-historico');
const formBusca = document.getElementById('form-busca');
const buscaInput = document.getElementById('busca-remedio');

const formPaciente = document.getElementById('form-paciente');
const mensagemSucessoPaciente = document.getElementById('mensagem-sucesso-paciente');
const listaPacientes = document.getElementById('lista-pacientes');
const contadorPacientes = document.getElementById('contador-pacientes');

const metricDosesTomadas = document.getElementById('metric-doses-tomadas');
const metricDosesAtrasadas = document.getElementById('metric-doses-atrasadas');
const metricPacientes = document.getElementById('metric-pacientes');

let termoBuscaHistorico = '';

function mostrarMensagem(elemento) {
    elemento.hidden = false;

    window.setTimeout(() => {
        elemento.hidden = true;
    }, 3000);
}

function criarEstadoVazio(texto) {
    const li = document.createElement('li');
    li.className = 'data-list__empty';
    li.textContent = texto;
    return li;
}

function atualizarMetricas(pacientes, remedios) {
    metricPacientes.textContent = pacientes.length;
    metricDosesTomadas.textContent = remedios.length;

    const dosesComAtencao = remedios.filter((item) => item.tipo !== 'comprimido').length;
    metricDosesAtrasadas.textContent = dosesComAtencao;
}

function atualizarContadorPacientes(total) {
    contadorPacientes.textContent = `${total} ${total === 1 ? 'paciente' : 'pacientes'}`;
}

function renderizarPacientes(pacientes) {
    listaPacientes.innerHTML = '';
    atualizarContadorPacientes(pacientes.length);

    if (pacientes.length === 0) {
        listaPacientes.appendChild(criarEstadoVazio('Nenhum paciente cadastrado ainda.'));
        return;
    }

    pacientes.forEach((paciente) => {
        const li = document.createElement('li');
        li.className = 'data-list__item';

        li.innerHTML = `
            <div class="data-list__main">
                <span class="data-list__title">${paciente.nome}</span>
                <span class="data-list__meta">${paciente.telefone} | ${paciente.email}</span>
            </div>
            <div class="data-list__actions">
                <button type="button" class="button-danger" data-delete-paciente="${paciente.id}">Excluir</button>
            </div>
        `;

        listaPacientes.appendChild(li);
    });
}

function renderizarHistorico(remedios) {
    listaHistorico.innerHTML = '';

    if (remedios.length === 0) {
        listaHistorico.appendChild(criarEstadoVazio('Nenhum medicamento encontrado para este filtro.'));
        return;
    }

    remedios.forEach((item) => {
        const li = document.createElement('li');
        const statusClasse = item.tipo === 'comprimido' ? 'badge badge--success' : 'badge badge--warning';
        const statusTexto = item.tipo === 'comprimido' ? 'Comprimido' : 'Gotas';

        li.className = 'data-list__item';
        li.innerHTML = `
            <div class="data-list__main">
                <span class="data-list__title">${item.hora} - ${item.remedio}</span>
                <span class="data-list__meta">Dose: ${item.dose}mg | Forma: ${item.tipo}</span>
            </div>
            <div class="data-list__actions">
                <span class="${statusClasse}">${statusTexto}</span>
                <button type="button" class="button-danger" data-delete-remedio="${item.id}">Excluir</button>
            </div>
        `;

        listaHistorico.appendChild(li);
    });
}

async function atualizarTelaPacientes() {
    const pacientes = await buscarItens('pacientes');
    const remedios = await buscarItens('remedios');

    renderizarPacientes(pacientes);
    atualizarMetricas(pacientes, remedios);
}

async function atualizarTelaHistorico() {
    const pacientes = await buscarItens('pacientes');
    const remedios = await buscarItens('remedios');
    const termo = termoBuscaHistorico.trim().toLowerCase();
    const filtrados = termo
        ? remedios.filter((item) => item.remedio.toLowerCase().includes(termo))
        : remedios;

    renderizarHistorico(filtrados);
    atualizarMetricas(pacientes, remedios);
}

async function atualizarTudo() {
    await atualizarTelaPacientes();
    await atualizarTelaHistorico();
}

async function deletarPacienteERecarregar(id) {
    await deletarItem('pacientes', id);
    await atualizarTudo();
}

async function deletarRemedioERecarregar(id) {
    await deletarItem('remedios', id);
    await atualizarTudo();
}

formPaciente.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const novoPaciente = {
        nome: document.getElementById('paciente-nome').value,
        email: document.getElementById('paciente-email').value,
        telefone: document.getElementById('paciente-telefone').value
    };

    await adicionarItem('pacientes', novoPaciente);
    formPaciente.reset();
    mostrarMensagem(mensagemSucessoPaciente);
    await atualizarTudo();
});

formRemedio.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const tipoSelecionado = document.querySelector('input[name="tipo"]:checked');
    const novoRemedio = {
        remedio: document.getElementById('remedio-nome').value,
        dose: document.getElementById('remedio-dose').value,
        tipo: tipoSelecionado ? tipoSelecionado.value : 'Não informado',
        hora: document.getElementById('remedio-hora').value
    };

    await adicionarItem('remedios', novoRemedio);
    formRemedio.reset();
    mostrarMensagem(mensagemSucessoRemedio);
    await atualizarTudo();
});

formBusca.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    termoBuscaHistorico = buscaInput.value;
    await atualizarTelaHistorico();
});

buscaInput.addEventListener('input', async () => {
    if (buscaInput.value.trim() === '') {
        termoBuscaHistorico = '';
        await atualizarTelaHistorico();
    }
});

listaPacientes.addEventListener('click', async (evento) => {
    const botao = evento.target.closest('[data-delete-paciente]');

    if (!botao) {
        return;
    }

    await deletarPacienteERecarregar(Number(botao.dataset.deletePaciente));
});

listaHistorico.addEventListener('click', async (evento) => {
    const botao = evento.target.closest('[data-delete-remedio]');

    if (!botao) {
        return;
    }

    await deletarRemedioERecarregar(Number(botao.dataset.deleteRemedio));
});

atualizarTudo();
