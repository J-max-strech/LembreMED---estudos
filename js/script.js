/**
 * LembreMED - Core Logic (Modular Version)
 */

// --- Authentication & Session ---

function checkAuth() {
    const logged = localStorage.getItem('lembremed_logged');
    const user = JSON.parse(localStorage.getItem('lembremed_user'));
    const path = window.location.pathname;

    if (logged !== 'true' || !user) {
        if (!path.endsWith('login.html') && !path.endsWith('cadastro.html')) {
            // Se estiver na pasta pages/, precisa subir um nível
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
    // Seções com animação de fade
    const sections = document.querySelectorAll('.section-content');
    const buttons = document.querySelectorAll('.sub-nav-btn');
    
    sections.forEach(s => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(10px)';
        setTimeout(() => s.classList.remove('active'), 200);
    });
    
    buttons.forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    setTimeout(() => {
        const target = document.getElementById('section-' + sectionId);
        if (target) {
            target.classList.add('active');
            setTimeout(() => {
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
            }, 50);
        }
        
        // Renderizar dados específicos
        if (sectionId === 'doencas') renderDiseases();
        if (sectionId === 'historico') renderPatientHistory();
        if (sectionId === 'cadastrar') populateDiseaseSelect();
        if (sectionId === 'inicio' || sectionId === 'medicamentos') renderPatientMeds();
    }, 250);
}

function showNotification(title, message, icon = '✓') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);
    
    // Animação de entrada suave
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// --- Modal Management ---

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showConfirm(title, message, onConfirm) {
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = message;
    const btn = document.getElementById('btnConfirmAction');
    btn.onclick = () => {
        onConfirm();
        closeModal('confirmModal');
    };
    openModal('confirmModal');
}

// --- Data Accessors ---

function getPatients() {
    return JSON.parse(localStorage.getItem('lembremed_patients') || '[]');
}

function savePatients(patients) {
    localStorage.setItem('lembremed_patients', JSON.stringify(patients));
}

function getMeds() {
    return JSON.parse(localStorage.getItem('lembremed_meds') || '[]');
}

function saveMeds(meds) {
    localStorage.setItem('lembremed_meds', JSON.stringify(meds));
}

function getDiseases() {
    return JSON.parse(localStorage.getItem('lembremed_diseases') || '[]');
}

function saveDiseases(diseases) {
    localStorage.setItem('lembremed_diseases', JSON.stringify(diseases));
}

function getGlobalMeds() {
    return JSON.parse(localStorage.getItem('lembremed_meds_global') || '[]');
}

function saveGlobalMeds(meds) {
    localStorage.setItem('lembremed_meds_global', JSON.stringify(meds));
}

function getHistory() {
    return JSON.parse(localStorage.getItem('lembremed_history') || '[]');
}

function addToHistory(entry) {
    const history = getHistory();
    history.unshift({
        id: Date.now(),
        timestamp: new Date().toLocaleString('pt-BR'),
        ...entry
    });
    localStorage.setItem('lembremed_history', JSON.stringify(history));
}

// --- Render Functions ---

function renderPatientMeds() {
    const meds = getMeds();
    const listContainer = document.getElementById('medListContainer'); // Master list in "Meus Medicamentos"
    const nextDoseContainer = document.getElementById('nextDoseContainer'); // Highlight card in "Início"
    const upcomingList = document.getElementById('upcomingMedsList'); // Secondary list in "Início"
    const upcomingCard = document.getElementById('upcomingMedsCard');

    if (!listContainer || !nextDoseContainer) return;

    // --- Cálculo de Adesão ---
    const totalToday = meds.length;
    const takenToday = meds.filter(m => m.taken).length;
    const adherence = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;
    
    const circle = document.getElementById('patientAdherenceCircle');
    const text = document.getElementById('patientAdherenceText');
    if (circle && text) {
        circle.setAttribute('stroke-dasharray', `${adherence}, 100`);
        text.textContent = `${adherence}%`;
    }

    if (meds.length === 0) {
        listContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💊</div><p>Nenhum medicamento cadastrado ainda.</p></div>`;
        nextDoseContainer.innerHTML = '';
        if (upcomingCard) upcomingCard.style.display = 'none';
        return;
    }

    meds.sort((a, b) => a.time.localeCompare(b.time));
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // Próximo medicamento (o primeiro não tomado que seja >= agora, ou o primeiro não tomado)
    let nextMed = meds.find(m => m.time >= currentTime && !m.taken) || meds.find(m => !m.taken);

    if (nextMed) {
        nextDoseContainer.innerHTML = `
            <div class="card next-dose-card animate-fade" id="nextDoseCard">
                <h2>Próxima Dose</h2>
                <div class="med-name">${nextMed.name}</div>
                <div class="med-info">${nextMed.dose} • ${nextMed.time}</div>
                <button class="btn btn-primary btn-large" onclick="handleToggleNextDose(event, '${nextMed.id}')">Já Tomei!</button>
            </div>
        `;
        
        // Lista de outros medicamentos pendentes para hoje (Excluindo o destaque)
        const othersPending = meds.filter(m => !m.taken && m.id !== nextMed.id);
        if (upcomingList && upcomingCard) {
            if (othersPending.length > 0) {
                upcomingCard.style.display = 'block';
                upcomingList.innerHTML = '';
                othersPending.forEach(med => {
                    const item = document.createElement('div');
                    item.className = 'med-list-item';
                    item.innerHTML = `
                        <div class="med-time">${med.time}</div>
                        <div class="med-details"><h4>${med.name}</h4><p>${med.dose}</p></div>
                        <button class="med-status" onclick="handleToggleNextDose(event, '${med.id}')"></button>
                    `;
                    upcomingList.appendChild(item);
                });
            } else {
                upcomingCard.style.display = 'none';
            }
        }

    } else {
        nextDoseContainer.innerHTML = `<div class="card next-dose-card" style="border-color: var(--primary); border-left: 10px solid var(--primary);"><div class="empty-state-icon" style="font-size: 2rem; opacity: 1; color: var(--primary)">✓</div><div class="med-name" style="font-size: 1.5rem">Tudo em dia!</div><p>Você tomou todas as doses agendadas.</p></div>`;
        if (upcomingCard) upcomingCard.style.display = 'none';
    }

    // Master List (Aba "Meus Medicamentos" - mostra tudo)
    listContainer.innerHTML = '';
    meds.forEach(med => {
        const item = document.createElement('div');
        item.className = 'med-list-item animate-fade';
        item.innerHTML = `
            <div class="med-time">${med.time}</div>
            <div class="med-details">
                <h4>${med.name}</h4>
                <p>${med.dose} • ${med.frequency || 'N/A'}</p>
            </div>
            <div class="med-actions" style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="btn btn-outline" style="padding: 0.5rem; border-radius: 10px; width: 36px; height: 36px;" title="Editar" onclick="openEditMedModal('${med.id}')">✏️</button>
                <button class="btn btn-outline" style="padding: 0.5rem; border-radius: 10px; width: 36px; height: 36px; color: var(--alert); border-color: var(--alert-light);" title="Excluir" onclick="deleteMed('${med.id}')">🗑️</button>
                <button class="med-status ${med.taken ? 'taken' : ''}" onclick="toggleMedStatus('${med.id}')">${med.taken ? '✓' : ''}</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function handleToggleNextDose(event, id) {
    const card = event.target.closest('.card, .med-list-item');
    if (card) {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        card.style.backgroundColor = 'var(--primary-light)';
    }
    
    setTimeout(() => {
        toggleMedStatus(id);
    }, 400);
}

function toggleMedStatus(id) {
    const meds = getMeds();
    const medIndex = meds.findIndex(m => m.id === id);
    if (medIndex > -1) {
        meds[medIndex].taken = !meds[medIndex].taken;
        saveMeds(meds);
        
        if (meds[medIndex].taken) {
            const now = new Date();
            addToHistory({
                patientName: 'Você',
                medName: meds[medIndex].name,
                medDose: meds[medIndex].dose,
                scheduledTime: meds[medIndex].time,
                confirmTime: now.toLocaleTimeString('pt-BR'),
                confirmDate: now.toLocaleDateString('pt-BR')
            });
            showNotification('Dose Registrada', `Você marcou ${meds[medIndex].name} como tomado.`, '💊');
        }
        
        renderPatientMeds();
        // Se estiver na aba de histórico, atualiza ela também
        const histContainer = document.getElementById('patientHistoryContainer');
        if (histContainer && histContainer.offsetParent !== null) renderPatientHistory();
    }
}

function renderCaregiverDashboard() {
    const patients = getPatients();
    const meds = getGlobalMeds();
    const listContainer = document.getElementById('patientListContainer');
    const nextDoseContainer = document.getElementById('caregiverNextDose');
    
    if (!nextDoseContainer) return;

    // Próximas Doses
    const medsPending = meds.filter(m => !m.taken).sort((a,b) => a.time.localeCompare(b.time));
    nextDoseContainer.innerHTML = `<div class="card-title"><h3>Próximas Doses</h3></div><div class="next-doses-list" id="nextDosesList"></div>`;
    const nextList = document.getElementById('nextDosesList');
    
    if (medsPending.length === 0) {
        nextList.innerHTML = `<p style="text-align: center; padding: 1rem;">Nenhuma dose pendente.</p>`;
    } else {
        medsPending.slice(0, 5).forEach(med => {
            const p = patients.find(p => p.id === med.patientId);
            const item = document.createElement('div');
            item.className = 'mini-dose-item animate-fade';
            item.innerHTML = `
                <div class="mini-dose-info">
                    <p style="font-size: 0.7rem; color: var(--primary); font-weight: 800;">${p ? p.name : 'Paciente'}</p>
                    <h4>${med.name}</h4><p>${med.dose} • ${med.time}</p>
                </div>
                <button class="btn btn-primary" style="padding: 0.5rem 1rem;" onclick="confirmMedCaregiver(event, '${med.id}')">Confirmar</button>
            `;
            nextList.appendChild(item);
        });
    }

    // Adesão e Stats
    const avgAdherence = patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + (p.adherence || 0), 0) / patients.length) : 0;
    const circle = document.getElementById('adherenceCircle');
    const text = document.getElementById('adherenceText');
    if (circle && text) {
        circle.setAttribute('stroke-dasharray', `${avgAdherence}, 100`);
        text.textContent = `${avgAdherence}%`;
    }

    if (listContainer) {
        listContainer.innerHTML = '';
        patients.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card patient-card animate-fade';
            card.innerHTML = `
                <div class="patient-badge">${p.adherence || 0}% adesão</div>
                <h3>${p.name}</h3><p>${p.age} anos • ${p.condition}</p>
                <div class="progress-container"><div class="progress-bar" style="width: ${p.adherence || 0}%"></div></div>
                <button class="btn btn-outline" style="width: 100%; margin-top: 1rem;" onclick="showPatientDetails('${p.id}')">Ver Detalhes</button>
            `;
            listContainer.appendChild(card);
        });
    }
}

function showPatientDetails(patientId) {
    const patients = getPatients();
    const meds = getGlobalMeds();
    const p = patients.find(p => p.id === patientId);
    if (!p) return;
    
    const patientMeds = meds.filter(m => m.patientId === patientId);
    document.getElementById('detName').innerText = p.name;
    const content = document.getElementById('patientDetailsContent');
    
    content.innerHTML = `
        <div class="detail-section">
            <h4>👤 Informações</h4>
            <p><strong>Idade:</strong> ${p.age} anos</p>
            <p><strong>Condição:</strong> ${p.condition}</p>
            <p><strong>Contato:</strong> ${p.emergencyContact || 'Não cadastrado'}</p>
        </div>
        <div class="detail-section">
            <h4>💊 Medicamentos</h4>
            ${patientMeds.map(m => `<div class="med-item-detail"><strong>${m.name}</strong> - ${m.time}</div>`).join('')}
        </div>
    `;
    
    openModal('patientDetailsModal');
    document.getElementById('btnDeletePatient').onclick = () => {
        if(confirm(`Excluir ${p.name}?`)) {
            const updated = getPatients().filter(pat => pat.id !== p.id);
            savePatients(updated);
            window.location.reload();
        }
    };
}

function confirmMedCaregiver(event, medId) {
    const meds = getGlobalMeds();
    const med = meds.find(m => m.id === medId);
    if (med) {
        med.taken = true;
        saveGlobalMeds(meds);
        addToHistory({
            patientName: getPatients().find(p => p.id === med.patientId)?.name || 'Paciente',
            medName: med.name,
            confirmTime: new Date().toLocaleTimeString('pt-BR')
        });
        showNotification('Dose Confirmada', 'A dose foi registrada no histórico.', '💊');
        setTimeout(() => window.location.reload(), 1000);
    }
}

function renderHistory() {
    const history = getHistory();
    const container = document.getElementById('historyListContainer');
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = `<p style="text-align: center; padding: 2rem;">Nenhum registro encontrado.</p>`;
        return;
    }
    
    container.innerHTML = history.map(h => `
        <div class="history-item animate-fade">
            <div class="history-icon">✓</div>
            <div class="history-info">
                <h4>${h.patientName}</h4>
                <p>${h.medName} tomado às ${h.confirmTime} em ${h.timestamp.split(',')[0]}</p>
            </div>
        </div>
    `).join('');
}

function renderPatientHistory() {
    const history = getHistory();
    const container = document.getElementById('patientHistoryContainer');
    if (!container) return;
    
    // Filtra apenas o histórico do próprio paciente (onde patientName é 'Você')
    const myHistory = history.filter(h => h.patientName === 'Você');

    if (myHistory.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📜</div><p>Nenhuma dose registrada no histórico ainda.</p></div>`;
        return;
    }
    
    container.innerHTML = myHistory.map(h => `
        <div class="history-item animate-fade">
            <div class="history-icon">✓</div>
            <div class="history-info">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4>${h.medName}</h4>
                    <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 800;">TOMADO</span>
                </div>
                <p><strong>Dose:</strong> ${h.medDose || 'N/A'} | <strong>Agendado:</strong> ${h.scheduledTime || 'N/A'}</p>
                <p style="font-size: 0.8rem; margin-top: 4px; color: var(--text-light);">Confirmado em ${h.confirmDate} às ${h.confirmTime}</p>
            </div>
        </div>
    `).join('');
}

function renderDiseases() {
    const diseases = getDiseases();
    const container = document.getElementById('diseaseListContainer');
    if (!container) return;

    if (diseases.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🏥</div><p>Nenhuma doença cadastrada.</p></div>`;
        return;
    }

    container.innerHTML = '';
    diseases.forEach(d => {
        const item = document.createElement('div');
        item.className = 'disease-item animate-fade';
        item.innerHTML = `
            <div class="med-details">
                <h4>${d.name}</h4>
                <p>${d.note || 'Sem observações'}</p>
            </div>
            <div class="med-actions" style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="btn btn-outline" style="padding: 0.5rem; border-radius: 10px; width: 36px; height: 36px;" title="Editar" onclick="openEditDiseaseModal('${d.id}')">✏️</button>
                <button class="btn btn-outline" style="padding: 0.5rem; border-radius: 10px; width: 36px; height: 36px; color: var(--alert); border-color: var(--alert-light);" title="Excluir" onclick="deleteDisease('${d.id}')">🗑️</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function deleteDisease(id) {
    showConfirm('Excluir Doença', 'Tem certeza que deseja excluir esta doença? Esta ação não pode ser desfeita.', () => {
        const diseases = getDiseases().filter(d => d.id !== id);
        saveDiseases(diseases);
        renderDiseases();
        showNotification('Doença Removida', 'A doença foi excluída da sua lista.', '🗑️');
    });
}

function deleteMed(id) {
    showConfirm('Excluir Medicamento', 'Tem certeza que deseja excluir este medicamento? Esta ação removerá o agendamento.', () => {
        const meds = getMeds().filter(m => m.id !== id);
        saveMeds(meds);
        renderPatientMeds();
        showNotification('Medicamento Removido', 'O medicamento foi excluído da sua rotina.', '🗑️');
    });
}

function openAddMedModal() {
    const form = document.getElementById('medFormPatient');
    if (form) form.reset();
    document.getElementById('medId').value = '';
    document.querySelector('#medPatientModal h2').innerText = 'Novo Medicamento';
    openModal('medPatientModal');
}

function openAddDiseaseModal() {
    const form = document.getElementById('diseaseForm');
    if (form) form.reset();
    document.getElementById('diseaseId').value = '';
    document.querySelector('#diseaseModal h2').innerText = 'Cadastrar Doença';
    openModal('diseaseModal');
}

function openEditMedModal(id) {
    const meds = getMeds();
    const med = meds.find(m => m.id === id);
    if (!med) return;

    document.getElementById('medId').value = med.id;
    document.getElementById('medName').value = med.name;
    document.getElementById('medDose').value = med.dose;
    document.getElementById('medTime').value = med.time;
    document.getElementById('medFreq').value = med.frequency || '';
    document.getElementById('medDisease').value = med.disease || '';
    
    document.querySelector('#medPatientModal h2').innerText = 'Editar Medicamento';
    openModal('medPatientModal');
}

function openEditDiseaseModal(id) {
    const diseases = getDiseases();
    const disease = diseases.find(d => d.id === id);
    if (!disease) return;

    document.getElementById('diseaseId').value = disease.id;
    document.getElementById('diseaseName').value = disease.name;
    document.getElementById('diseaseNote').value = disease.note || '';
    
    document.querySelector('#diseaseModal h2').innerText = 'Editar Doença';
    openModal('diseaseModal');
}

function populateDiseaseSelect() {
    const diseases = getDiseases();
    const select = document.getElementById('medDisease');
    if (!select) return;

    select.innerHTML = '<option value="">Nenhuma</option>';
    diseases.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.name;
        opt.innerText = d.name;
        select.appendChild(opt);
    });
}

// --- Custom Select Logic ---

function populatePatientSelect() {
    const patients = getPatients();
    const optionsContainer = document.getElementById('patientOptionsContainer');
    if (!optionsContainer) return;
    
    optionsContainer.innerHTML = '<div class="custom-option placeholder">Selecione um paciente</div>';
    patients.forEach(p => {
        const opt = document.createElement('div');
        opt.className = 'custom-option';
        opt.setAttribute('data-value', p.id);
        opt.innerHTML = `👤 ${p.name}`;
        optionsContainer.appendChild(opt);
    });
    initCustomSelect();
}

function initCustomSelect() {
    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const options = wrapper.querySelectorAll('.custom-option:not(.placeholder)');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        const selectedText = wrapper.querySelector('.selected-text') || wrapper.querySelector('#selectedPatientText');

        trigger.onclick = (e) => {
            e.stopPropagation();
            wrapper.classList.toggle('open');
        };

        options.forEach(option => {
            option.onclick = (e) => {
                e.stopPropagation();
                hiddenInput.value = option.getAttribute('data-value') || option.innerText;
                selectedText.innerText = option.innerText;
                wrapper.classList.remove('open');
            };
        });
    });
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const path = window.location.pathname;

    // Inicialização baseada na página
    if (path.endsWith('inicio.html')) renderCaregiverDashboard();
    if (path.endsWith('pacientes.html')) { /* nada específico no carregamento */ }
    if (path.endsWith('medicamentos.html')) populatePatientSelect();
    if (path.endsWith('historico.html')) renderHistory();
    if (path.endsWith('paciente-view.html')) renderPatientMeds();

    // Eventos de formulário
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'signupForm') return; // Handled in-page
        if (e.target.id === 'loginForm') return; // Handled in-page

        e.preventDefault();
        
        if (e.target.id === 'patientFormCaregiver') {
            const patients = getPatients();
            patients.push({
                id: Date.now().toString(),
                name: document.getElementById('pName').value,
                age: document.getElementById('pAge').value,
                condition: document.getElementById('pCondition').value,
                emergencyContact: document.getElementById('pContact').value,
                adherence: 0
            });
            savePatients(patients);
            showNotification('Paciente Cadastrado', 'Novo paciente adicionado.', '👤');
            setTimeout(() => window.location.href = 'inicio.html', 1000);
        }

        if (e.target.id === 'medFormCaregiver') {
            const meds = getGlobalMeds();
            meds.push({
                id: Date.now().toString(),
                patientId: document.getElementById('mPatient').value,
                name: document.getElementById('mName').value,
                dose: document.getElementById('mDose').value,
                time: document.getElementById('mTime').value,
                frequency: document.getElementById('mFreq').value,
                taken: false
            });
            saveGlobalMeds(meds);
            showNotification('Medicamento Adicionado', 'Vinculado ao paciente.', '💊');
            setTimeout(() => window.location.href = 'inicio.html', 1000);
        }

        if (e.target.id === 'medForm') { // Patient view (Modal - deprecated/legacy)
            const meds = getMeds();
            meds.push({
                id: Date.now().toString(),
                name: document.getElementById('medName').value,
                type: document.getElementById('medType').value,
                dose: document.getElementById('medDose').value,
                time: document.getElementById('medTime').value,
                taken: false
            });
            saveMeds(meds);
            closeModal('medModal');
            renderPatientMeds();
        }

        if (e.target.id === 'medFormPatient') { // Patient view (Modal)
            const meds = getMeds();
            const medId = document.getElementById('medId').value;
            
            const medData = {
                name: document.getElementById('medName').value,
                dose: document.getElementById('medDose').value,
                time: document.getElementById('medTime').value,
                frequency: document.getElementById('medFreq').value,
                disease: document.getElementById('medDisease').value,
                taken: false
            };

            if (medId) {
                // Editar
                const index = meds.findIndex(m => m.id === medId);
                if (index > -1) {
                    meds[index] = { ...meds[index], ...medData };
                }
            } else {
                // Novo
                meds.push({ id: Date.now().toString(), ...medData });
            }

            saveMeds(meds);
            showNotification(medId ? 'Medicamento Atualizado' : 'Medicamento Salvo', 'Sua rotina foi atualizada.', '💊');
            e.target.reset();
            document.getElementById('medId').value = '';
            closeModal('medPatientModal');
            renderPatientMeds();
        }

        if (e.target.id === 'diseaseForm') {
            const diseases = getDiseases();
            const diseaseId = document.getElementById('diseaseId').value;
            
            const diseaseData = {
                name: document.getElementById('diseaseName').value,
                note: document.getElementById('diseaseNote').value
            };

            if (diseaseId) {
                // Editar
                const index = diseases.findIndex(d => d.id === diseaseId);
                if (index > -1) {
                    diseases[index] = { ...diseases[index], ...diseaseData };
                }
            } else {
                // Novo
                diseases.push({ id: Date.now().toString(), ...diseaseData });
            }

            saveDiseases(diseases);
            showNotification(diseaseId ? 'Doença Atualizada' : 'Doença Salva', 'Informações atualizadas com sucesso.', '🏥');
            e.target.reset();
            document.getElementById('diseaseId').value = '';
            closeModal('diseaseModal');
            renderDiseases();
        }
    });

    // Close modals
    window.onclick = (event) => {
        if (event.target.classList.contains('modal-overlay')) {
            event.target.style.display = 'none';
        }
    };

    // Restrição numérica
    ['pAge', 'pContact'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, ''); });
    });
});