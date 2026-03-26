/* =========================================================================
   controller.js - A ponte entre o HTML e o Banco de Dados
   ========================================================================= */

// --- ELEMENTOS DO HTML ---
// Remédios
const formRemedio = document.getElementById('form-remedio');
const mensagemSucessoRemedio = document.getElementById('mensagem-sucesso');
const listaHistorico = document.querySelector('#historico ul');

// Pacientes 
const formPaciente = document.getElementById('form-paciente');
const mensagemSucessoPaciente = document.getElementById('mensagem-sucesso-paciente');
const listaPacientes = document.getElementById('lista-pacientes'); // NOVO: Captura a lista de pacientes


// ==========================================
// LÓGICA DE PACIENTES (NOVIDADE)
// ==========================================

async function atualizarTelaPacientes() {
    const pacientes = await buscarItens('pacientes'); // Puxa do banco
    listaPacientes.innerHTML = ''; // Limpa a tela

    if (pacientes.length === 0) {
        listaPacientes.innerHTML = '<li style="padding: 10px;">Nenhum paciente cadastrado ainda.</li>';
        return;
    }

    // Desenha cada paciente na tela
    pacientes.forEach(paciente => {
        const li = document.createElement('li');
        li.style.padding = '15px 10px';
        li.style.borderBottom = '1px solid #eee';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';

        li.innerHTML = `
            <span><strong>${paciente.nome}</strong><br><small style="color: #666;">${paciente.telefone} | ${paciente.email}</small></span>
            <button onclick="deletarPacienteERecarregar(${paciente.id})" style="padding: 5px 10px; width: auto; background-color: var(--secundaria); font-size: 0.8rem; margin-top: 0;">Excluir</button>
        `;
        listaPacientes.appendChild(li);
    });
}

async function deletarPacienteERecarregar(id) {
    await deletarItem('pacientes', id); // Deleta da tabela pacientes
    atualizarTelaPacientes(); // Recarrega a lista
}

formPaciente.addEventListener('submit', async function(evento) {
    evento.preventDefault(); 
    
    const nomePaciente = document.querySelector('#form-paciente input[name="nome"]').value;
    const emailPaciente = document.querySelector('#form-paciente input[name="email"]').value;
    const telPaciente = document.querySelector('#form-paciente input[name="telefone"]').value;

    const novoPaciente = {
        nome: nomePaciente,
        email: emailPaciente,
        telefone: telPaciente
    };

    await adicionarItem('pacientes', novoPaciente);

    mensagemSucessoPaciente.style.display = 'block';
    formPaciente.reset();
    
    setTimeout(() => {
        mensagemSucessoPaciente.style.display = 'none';
    }, 3000);

    // NOVO: Chama a função para atualizar a lista na hora que salva!
    atualizarTelaPacientes(); 
});


// ==========================================
// LÓGICA DE REMÉDIOS (Continua igual)
// ==========================================

async function atualizarTela() {
    const remedios = await buscarItens('remedios');
    listaHistorico.innerHTML = '';

    if (remedios.length === 0) {
        listaHistorico.innerHTML = '<li>Nenhum remédio cadastrado ainda.</li>';
        return;
    }

    remedios.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${item.hora}</strong> - ${item.remedio} (${item.dose}mg, ${item.tipo})</span>
            <button onclick="deletarERecarregar(${item.id})" style="padding: 5px 10px; margin-left: auto; width: auto; background-color: var(--secundaria); font-size: 0.8rem;">Excluir</button>
        `;
        listaHistorico.appendChild(li);
    });
}

async function deletarERecarregar(id) {
    await deletarItem('remedios', id);
    atualizarTela();
}

formRemedio.addEventListener('submit', async function(evento) {
    evento.preventDefault(); 
    const nomeInput = document.querySelector('input[name="remedio"]').value;
    const doseInput = document.querySelector('input[name="dose"]').value;
    const horaInput = document.querySelector('input[name="hora"]').value;
    const tipoSelecionado = document.querySelector('input[name="tipo"]:checked');
    const tipoValor = tipoSelecionado ? tipoSelecionado.value : 'Não informado';

    const novoRemedio = { remedio: nomeInput, dose: doseInput, tipo: tipoValor, hora: horaInput };

    await adicionarItem('remedios', novoRemedio);

    mensagemSucessoRemedio.style.display = 'block';
    formRemedio.reset();
    setTimeout(() => { mensagemSucessoRemedio.style.display = 'none'; }, 3000);

    atualizarTela();
});


// ==========================================
// INICIALIZAÇÃO DA TELA (Quando a página abre)
// ==========================================
atualizarTela(); // Puxa os remédios
atualizarTelaPacientes(); // Puxa os pacientes
