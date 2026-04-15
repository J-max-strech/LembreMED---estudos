/**
 * controller.js - Ponte entre o HTML e o Banco de Dados (IndexedDB).
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Controlador carregado.");
    
    try {
        await iniciarBanco();
        console.log("Banco pronto para uso.");
        listarDados(); 
        
        if (document.getElementById('mPatient')) {
            popularSelectPacientes();
        }
    } catch (err) {
        console.error("Falha ao iniciar banco:", err);
    }

    // --- Cadastro/Edição de Pacientes (Modo Cuidador) ---
    const patientForm = document.getElementById('patientFormCaregiver');
    if (patientForm) {
        patientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novoPaciente = {
                nome: document.getElementById('pName').value,
                idade: document.getElementById('pAge').value,
                condicao: document.getElementById('pCondition').value,
                contato: document.getElementById('pContact').value,
                dataCadastro: new Date().toISOString()
            };

            try {
                await adicionarItem('pacientes', novoPaciente);
                showSuccessModal("Paciente Cadastrado", `${novoPaciente.nome} foi adicionado com sucesso.`);
                patientForm.reset();
                listarDados();
                setTimeout(() => window.location.href = 'inicio.html', 2000);
            } catch (err) {
                console.error("Erro ao salvar paciente:", err);
            }
        });
    }

    // --- Cadastro de Medicamentos (Modo Cuidador) ---
    const medFormCaregiver = document.getElementById('medFormCaregiver');
    if (medFormCaregiver) {
        medFormCaregiver.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novoMedicamento = {
                paciente: document.getElementById('mPatient').value,
                nome: document.getElementById('mName').value,
                dose: document.getElementById('mDose').value,
                horario: document.getElementById('mTime').value,
                frequencia: document.getElementById('mFreq').value,
                taken: false,
                dataCadastro: new Date().toISOString()
            };

            try {
                await adicionarItem('medicamentos', novoMedicamento);
                showSuccessModal("Medicamento Salvo", `O remédio ${novoMedicamento.nome} foi agendado.`);
                medFormCaregiver.reset();
                listarDados();
                setTimeout(() => window.location.href = 'inicio.html', 2000);
            } catch (err) {
                console.error("Erro ao salvar medicamento:", err);
            }
        });
    }

    // --- Cadastro/Edição de Medicamentos (Modo Paciente) ---
    const medFormPatient = document.getElementById('medFormPatient');
    if (medFormPatient) {
        medFormPatient.addEventListener('submit', async (e) => {
            e.preventDefault();
            const medId = document.getElementById('medId').value;
            
            const medData = {
                nome: document.getElementById('medName').value,
                dose: document.getElementById('medDose').value,
                horario: document.getElementById('medTime').value,
                frequencia: document.getElementById('medFreq').value,
                taken: false,
                dataCadastro: new Date().toISOString()
            };

            try {
                if (medId) {
                    // Atualizar existente
                    medData.id = parseInt(medId);
                    await atualizarItem('medicamentos', medData);
                    showSuccessModal("Medicamento Atualizado", "As alterações foram salvas.");
                } else {
                    // Novo cadastro
                    await adicionarItem('medicamentos', medData);
                    showSuccessModal("Medicamento Adicionado", "Sua rotina foi atualizada com sucesso.");
                }
                
                medFormPatient.reset();
                document.getElementById('medId').value = '';
                closeModal('medPatientModal');
                if (typeof renderPatientMeds === 'function') renderPatientMeds();
            } catch (err) {
                console.error(err);
            }
        });
    }

    // --- Cadastro/Edição de Doenças (Modo Paciente) ---
    const diseaseForm = document.getElementById('diseaseForm');
    if (diseaseForm) {
        diseaseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const diseaseId = document.getElementById('diseaseId').value;
            const diseases = JSON.parse(localStorage.getItem('lembremed_diseases') || '[]');
            
            const diseaseData = {
                nome: document.getElementById('diseaseName').value,
                nota: document.getElementById('diseaseNote').value,
                dataCadastro: new Date().toISOString()
            };

            if (diseaseId !== '') {
                // Editar (Usamos o index do array como ID)
                diseases[parseInt(diseaseId)] = diseaseData;
                showSuccessModal("Condição Atualizada", "As informações foram salvas.");
            } else {
                // Novo
                diseases.push(diseaseData);
                showSuccessModal("Condição Salva", "A nova condição foi registrada.");
            }

            localStorage.setItem('lembremed_diseases', JSON.stringify(diseases));
            diseaseForm.reset();
            document.getElementById('diseaseId').value = '';
            closeModal('diseaseModal');
            if (typeof renderDiseases === 'function') renderDiseases();
        });
    }
});

async function popularSelectPacientes() {
    const select = document.getElementById('mPatient');
    if (!select) return;
    
    try {
        const pacientes = await buscarItens('pacientes');
        select.innerHTML = '<option value="" disabled selected>Selecione um paciente</option>';
        pacientes.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.nome;
            opt.innerText = p.nome;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
    }
}

async function listarDados() {
    const container = document.getElementById('listaMedicamentosDB');
    if (!container) return;

    try {
        const medicamentos = await buscarItens('medicamentos');
        container.innerHTML = ""; 

        if (medicamentos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-state-icon">💊</span>
                    <p>Nenhum medicamento salvo encontrado.</p>
                </div>`;
            return;
        }

        medicamentos.forEach(med => {
            const item = document.createElement('div');
            item.className = 'card-item animate-fade';
            item.style.padding = '1.5rem';
            item.innerHTML = `
                <div class="card-item-info">
                    <span style="font-size: 0.7rem; color: var(--primary); font-weight: 800; text-transform: uppercase; margin-bottom: 4px; display: block;">${med.paciente || 'Paciente'}</span>
                    <h4 style="font-size: 1.2rem;">${med.nome}</h4>
                    <p style="margin: 4px 0;">${med.dose} • <strong>${med.horario}</strong></p>
                    <p style="font-size: 0.85rem; opacity: 0.7;">${med.frequencia}</p>
                </div>
                <button class="btn-remove" onclick="removerItem(${med.id})" style="display: flex; align-items: center; gap: 8px; padding: 0.75rem 1rem;">
                    <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    <span>Remover</span>
                </button>
            `;
            container.appendChild(item);
        });
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        console.error("Erro ao listar dados:", err);
    }
}

async function removerItem(id) {
    showConfirm("Excluir Item", "Deseja realmente remover este registro?", async () => {
        try {
            await deletarItem('medicamentos', id);
            listarDados();
            showNotification("Removido", "O item foi excluído do banco de dados.");
        } catch (err) {
            console.error(err);
        }
    });
}
