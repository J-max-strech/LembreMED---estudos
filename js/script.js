/**
 * LembreMED - Core Logic (Refactored to IndexedDB)
 */

// --- Global Settings ---
function applyGlobalSettings() {
    const fontSize = localStorage.getItem('lembremed_font_size') || 'normal';
    document.body.classList.remove('font-large', 'font-xl');
    if (fontSize !== 'normal') {
        document.body.classList.add('font-' + fontSize);
    }
    
    // Aplicar perfil salvo
    const user = JSON.parse(localStorage.getItem('lembremed_user'));
    if (user) {
        const nameInput = document.getElementById('configName');
        const emailInput = document.getElementById('configEmail');
        if (nameInput) nameInput.value = user.nome || '';
        if (emailInput) emailInput.value = user.email || '';
    }
}

// --- Authentication & Session ---
function checkAuth() {
    const logged = localStorage.getItem('lembremed_logged');
    const user = JSON.parse(localStorage.getItem('lembremed_user'));
    const path = window.location.pathname;

    if (logged !== 'true' || !user) {
        if (!path.endsWith('login.html') && !path.endsWith('cadastro.html')) {
            const prefix = path.includes('/pages/') ? '../' : '';
            window.location.href = prefix + 'login.html';
        }
        return;
    }

    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) nameDisplay.innerText = `Olá, ${user.nome}`;
}

function logout() {
    localStorage.removeItem('lembremed_logged');
    const path = window.location.pathname;
    const prefix = path.includes('/pages/') ? '../' : '';
    window.location.href = prefix + 'login.html';
}

// --- UI Helpers ---
function showSection(sectionId, btn) {
    const sections = document.querySelectorAll('.section-content');
    const buttons = document.querySelectorAll('.sub-nav-btn');
    
    sections.forEach(s => s.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    if (btn) btn.classList.add('active');

    const target = document.getElementById('section-' + sectionId);
    if (target) target.classList.add('active');
    
    if (sectionId === 'doencas') renderDiseases();
    if (sectionId === 'historico') renderPatientHistory();
    if (sectionId === 'medicamentos' || sectionId === 'inicio') renderPatientMeds();
}

function showNotification(title, message, icon = '✓') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    if (modal) {
        document.querySelector('#successModal .alert-card-title').innerText = title;
        document.querySelector('#successModal .alert-card-message').innerText = message;
        modal.style.display = 'flex';
    } else {
        showNotification(title, message);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Limpar IDs ocultos ao fechar
        const medIdInput = document.getElementById('medId');
        if (medIdInput) medIdInput.value = '';
        const diseaseIdInput = document.getElementById('diseaseId');
        if (diseaseIdInput) diseaseIdInput.value = '';
    }
}

function showConfirm(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    if (!modal) {
        if (confirm(message)) onConfirm();
        return;
    }
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = message;
    const btn = document.getElementById('btnConfirmAction');
    btn.onclick = () => {
        onConfirm();
        closeModal('confirmModal');
    };
    openModal('confirmModal');
}

// --- Dashboard & Data Rendering ---

async function updateDashboardStats() {
    try {
        const meds = await buscarItens('medicamentos');
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const taken = meds.filter(m => m.taken).length;
        const pending = meds.filter(m => !m.taken && m.horario >= currentTime).length;
        const missed = meds.filter(m => !m.taken && m.horario < currentTime).length;

        if (document.getElementById('statTaken')) document.getElementById('statTaken').innerText = taken;
        if (document.getElementById('statPending')) document.getElementById('statPending').innerText = pending;
        if (document.getElementById('statMissed')) document.getElementById('statMissed').innerText = missed;

        const total = meds.length;
        const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
        
        const adherenceText = document.getElementById('patientAdherenceText');
        if (adherenceText) adherenceText.innerText = `${adherence}%`;

        const circle = document.getElementById('adherenceCircle');
        if (circle) circle.setAttribute('stroke-dasharray', `${adherence}, 100`);

    } catch (err) {
        console.error("Erro ao atualizar stats:", err);
    }
}

async function renderPatientMeds() {
    const listContainer = document.getElementById('medListContainer');
    const nextDoseContainer = document.getElementById('nextDoseContainer');
    if (!listContainer) return;

    try {
        const meds = await buscarItens('medicamentos');
        
        // 1. Dashboard (Próximas Doses)
        if (nextDoseContainer) {
            const medsPending = meds.filter(m => !m.taken).sort((a,b) => a.horario.localeCompare(b.horario));
            if (medsPending.length === 0) {
                nextDoseContainer.innerHTML = '<p class="empty-state">Nenhuma dose pendente para hoje.</p>';
            } else {
                nextDoseContainer.innerHTML = '';
                medsPending.forEach(med => {
                    const item = document.createElement('div');
                    item.className = 'card-item animate-fade';
                    item.innerHTML = `
                        <div class="card-item-info">
                            <h4>${med.nome}</h4>
                            <p>${med.dose} • <strong>${med.horario}</strong></p>
                        </div>
                        <button class="btn btn-primary" onclick="confirmMedPatient('${med.id}')">Confirmar</button>
                    `;
                    nextDoseContainer.appendChild(item);
                });
            }
        }

        // 2. Listagem Principal
        if (meds.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">Você ainda não cadastrou nenhum medicamento.</p>';
            return;
        }

        listContainer.innerHTML = '';
        meds.forEach(med => {
            const item = document.createElement('div');
            item.className = 'card-item animate-fade';
            item.innerHTML = `
                <div class="card-item-info">
                    <h4>${med.nome}</h4>
                    <p>${med.dose} • <strong>${med.horario}</strong></p>
                    <p style="font-size: 0.8rem; opacity: 0.7;">Frequência: ${med.frequencia}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" style="padding: 0.5rem;" onclick="editMed(${med.id})">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-remove" style="padding: 0.5rem;" onclick="deleteMed('${med.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            listContainer.appendChild(item);
        });
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        updateDashboardStats();
    } catch (err) { console.error(err); }
}

async function confirmMedPatient(medId) {
    try {
        const meds = await buscarItens('medicamentos');
        // Usar == para comparar string com number se necessário
        const med = meds.find(m => m.id == medId);
        if (med) {
            med.taken = true;
            await atualizarItem('medicamentos', med);
            
            const history = JSON.parse(localStorage.getItem('lembremed_history') || '[]');
            history.unshift({
                medName: med.nome,
                horario: new Date().toLocaleTimeString('pt-BR'),
                data: new Date().toLocaleDateString('pt-BR')
            });
            localStorage.setItem('lembremed_history', JSON.stringify(history));

            showNotification("Dose Confirmada", "A dose foi registrada no histórico.");
            renderPatientMeds();
        }
    } catch (err) { console.error(err); }
}

async function editMed(id) {
    try {
        const meds = await buscarItens('medicamentos');
        const med = meds.find(m => m.id == id);
        if (med) {
            document.getElementById('medId').value = med.id;
            document.getElementById('medName').value = med.nome;
            document.getElementById('medDose').value = med.dose;
            document.getElementById('medTime').value = med.horario;
            document.getElementById('medFreq').value = med.frequencia;
            
            document.querySelector('#medPatientModal h2').innerText = 'Editar Medicamento';
            openModal('medPatientModal');
        }
    } catch (err) { console.error(err); }
}

async function renderDiseases() {
    const container = document.getElementById('diseaseListContainer');
    if (!container) return;
    const diseases = JSON.parse(localStorage.getItem('lembremed_diseases') || '[]');
    
    if (diseases.length === 0) {
        container.innerHTML = '<div class="empty-state"><span class="empty-state-icon">🏥</span><p>Nenhuma condição registrada.</p></div>';
        return;
    }
    container.innerHTML = diseases.map((d, index) => `
        <div class="card-item animate-fade">
            <div class="card-item-info">
                <h4>${d.nome}</h4>
                <p>${d.nota || 'Sem observações'}</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline" style="padding: 0.5rem;" onclick="editDisease(${index})">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="btn-remove" style="padding: 0.5rem;" onclick="removeDisease(${index})">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function editDisease(index) {
    const diseases = JSON.parse(localStorage.getItem('lembremed_diseases') || '[]');
    const d = diseases[index];
    if (d) {
        document.getElementById('diseaseId').value = index;
        document.getElementById('diseaseName').value = d.nome;
        document.getElementById('diseaseNote').value = d.nota || '';
        
        document.querySelector('#diseaseModal h2').innerText = 'Editar Condição';
        openModal('diseaseModal');
    }
}

async function deleteMed(id) {
    showConfirm("Excluir Medicamento", "Tem certeza que deseja remover este medicamento da sua rotina?", async () => {
        await deletarItem('medicamentos', parseInt(id));
        renderPatientMeds();
        showNotification("Removido", "Medicamento excluído com sucesso.", "🗑️");
    });
}

function removeDisease(index) {
    showConfirm("Excluir Doença", "Deseja remover este registro?", () => {
        const diseases = JSON.parse(localStorage.getItem('lembremed_diseases') || '[]');
        diseases.splice(index, 1);
        localStorage.setItem('lembremed_diseases', JSON.stringify(diseases));
        renderDiseases();
    });
}

async function renderPatientHistory() {
    const container = document.getElementById('patientHistoryContainer');
    if (!container) return;
    const history = JSON.parse(localStorage.getItem('lembremed_history') || '[]');

    if (history.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum registro no histórico.</p>';
        return;
    }

    container.innerHTML = history.map(h => `
        <div class="card-item animate-fade">
            <div class="card-item-info">
                <h4>${h.medName}</h4>
                <p>Tomado em ${h.data} às ${h.horario}</p>
            </div>
            <span class="badge" style="background: var(--primary-light); color: var(--primary);">✓ Tomado</span>
        </div>
    `).join('');
}

async function showPatientDetails(patientId) {
    try {
        const patients = await buscarItens('pacientes');
        const meds = await buscarItens('medicamentos');
        const p = patients.find(pat => pat.id == patientId);
        if (!p) return;

        const pMeds = meds.filter(m => m.paciente === p.nome);
        const modalContent = document.getElementById('patientDetailsContent');
        document.getElementById('detName').innerText = p.nome;
        
        modalContent.innerHTML = `
            <div style="display: grid; gap: 1.5rem;">
                <div class="card" style="background: #f8fafc; padding: 1.5rem; border: none;">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">👤 Informações Básicas</h4>
                    <p><strong>Idade:</strong> ${p.idade} anos</p>
                    <p><strong>Condição:</strong> ${p.condicao}</p>
                    <p><strong>Contato:</strong> ${p.contato || 'Não informado'}</p>
                </div>
                <div class="card" style="background: #f8fafc; padding: 1.5rem; border: none;">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">💊 Medicamentos Vinculados</h4>
                    ${pMeds.length > 0 ? pMeds.map(m => `
                        <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
                            <span>${m.nome}</span>
                            <strong>${m.horario}</strong>
                        </div>
                    `).join('') : '<p>Nenhum medicamento agendado.</p>'}
                </div>
            </div>`;

        const btnDelete = document.getElementById('btnDeletePatient');
        if (btnDelete) {
            btnDelete.onclick = () => {
                showConfirm("Excluir Paciente", `Tem certeza que deseja apagar todos os dados de ${p.nome}?`, async () => {
                    await deletarItem('pacientes', p.id);
                    closeModal('patientDetailsModal');
                    renderCaregiverDashboard();
                    showNotification("Removido", "Paciente excluído com sucesso.", "🗑️");
                });
            };
        }
        openModal('patientDetailsModal');
    } catch (err) { console.error(err); }
}

async function renderCaregiverDashboard() {
    const dosesDoDiaList = document.getElementById('dosesDoDiaList');
    const patientListContainer = document.getElementById('patientListContainer');
    if (!dosesDoDiaList) return;

    try {
        const meds = await buscarItens('medicamentos');
        const patients = await buscarItens('pacientes');
        const medsPending = meds.filter(m => !m.taken).sort((a,b) => a.horario.localeCompare(b.horario));

        if (medsPending.length === 0) {
            dosesDoDiaList.innerHTML = '<div class="empty-state"><span class="empty-state-icon">✅</span><p>Nenhuma dose agendada para hoje</p></div>';
        } else {
            dosesDoDiaList.innerHTML = '';
            medsPending.forEach(med => {
                const item = document.createElement('div');
                item.className = 'card-item animate-fade';
                item.innerHTML = `
                    <div class="card-item-info">
                        <span style="font-size: 0.7rem; color: var(--primary); font-weight: 800; text-transform: uppercase;">${med.paciente || 'Paciente'}</span>
                        <h4>${med.nome}</h4>
                        <p>${med.dose} • <strong>${med.horario}</strong></p>
                    </div>
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem;" onclick="confirmMedCaregiver('${med.id}')">Confirmar</button>
                `;
                dosesDoDiaList.appendChild(item);
            });
        }

        if (patientListContainer) {
            if (patients.length === 0) {
                patientListContainer.innerHTML = '<p class="empty-state">Nenhum paciente monitorado.</p>';
            } else {
                patientListContainer.innerHTML = '';
                patients.forEach(p => {
                    const pMeds = meds.filter(m => m.paciente === p.nome);
                    const pAdherence = pMeds.length > 0 ? Math.round((pMeds.filter(m => m.taken).length / pMeds.length) * 100) : 0;
                    const card = document.createElement('div');
                    card.className = 'card patient-card animate-fade';
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                            <h3>${p.nome}</h3>
                            <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 800;">${pAdherence}% adesão</span>
                        </div>
                        <p style="font-size: 0.9rem; margin-bottom: 1rem;">${p.condicao || 'Sem condição relatada'}</p>
                        <button class="btn btn-outline" style="width: 100%;" onclick="showPatientDetails('${p.id}')">Ver Detalhes</button>
                    `;
                    patientListContainer.appendChild(card);
                });
            }
        }
        updateDashboardStats();
    } catch (err) { console.error(err); }
}

async function confirmMedCaregiver(medId) {
    try {
        const meds = await buscarItens('medicamentos');
        const med = meds.find(m => m.id == medId);
        if (med) {
            med.taken = true;
            await atualizarItem('medicamentos', med); 
            showSuccessModal("Dose Confirmada", `${med.nome} foi marcado como tomado.`);
            renderCaregiverDashboard();
        }
    } catch (err) { console.error(err); }
}

// --- Sidebar Toggle ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    applyGlobalSettings();
    checkAuth();
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const path = window.location.pathname;
    if (path.endsWith('inicio.html')) renderCaregiverDashboard();
    if (path.endsWith('paciente-view.html')) {
        renderPatientMeds();
        if (typeof renderDiseases === 'function') renderDiseases();
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-modal') || e.target.closest('.close-modal')) {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.style.display = 'none';
        }
    });
});
