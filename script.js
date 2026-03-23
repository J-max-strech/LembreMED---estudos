/**
 * LembreMED - Core Logic
 */

// --- Authentication & Session ---

function checkAuth() {
    const logged = localStorage.getItem('lembremed_logged');
    const user = JSON.parse(localStorage.getItem('lembremed_user'));

    if (logged !== 'true' || !user) {
        if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('cadastro.html')) {
            window.location.href = 'login.html';
        }
        return;
    }

    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) nameDisplay.innerText = `Olá, ${user.nome}`;

    const patientView = document.getElementById('patientView');
    const caregiverView = document.getElementById('caregiverView');

    if (patientView && caregiverView) {
        if (user.role === 'paciente') {
            patientView.style.display = 'block';
            caregiverView.style.display = 'none';
            initPatientView();
        } else {
            caregiverView.style.display = 'block';
            patientView.style.display = 'none';
            initCaregiverView();
        }
    }
}

function logout() {
    localStorage.removeItem('lembremed_logged');
    window.location.href = 'login.html';
}

// --- UI Helpers ---

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
    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
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

// --- Patient Logic ---

function initPatientView() {
    renderPatientMeds();
}

function renderPatientMeds() {
    const meds = getMeds();
    const listContainer = document.getElementById('medListContainer');
    const nextDoseContainer = document.getElementById('nextDoseContainer');

    if (!listContainer || !nextDoseContainer) return;

    if (meds.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💊</div>
                <p>Nenhum medicamento cadastrado ainda.</p>
            </div>
        `;
        nextDoseContainer.innerHTML = '';
        return;
    }

    meds.sort((a, b) => a.time.localeCompare(b.time));
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    let nextMed = meds.find(m => m.time >= currentTime && !m.taken) || meds.find(m => !m.taken);

    if (nextMed) {
        nextDoseContainer.innerHTML = `
            <div class="card next-dose-card animate-fade">
                <h2>Próxima Dose</h2>
                <div class="med-name">${nextMed.name}</div>
                <div class="med-info">${nextMed.dose} • ${nextMed.time}</div>
                <button class="btn btn-primary btn-large" onclick="toggleMedStatus('${nextMed.id}')">Já Tomei!</button>
            </div>
        `;
    } else {
        nextDoseContainer.innerHTML = `
            <div class="card next-dose-card" style="border-color: var(--primary)">
                <div class="empty-state-icon" style="font-size: 2rem; opacity: 1; color: var(--primary)">✓</div>
                <div class="med-name" style="font-size: 1.5rem">Tudo em dia!</div>
                <p>Você tomou todas as doses agendadas por enquanto.</p>
            </div>
        `;
    }

    listContainer.innerHTML = '';
    meds.forEach(med => {
        const item = document.createElement('div');
        item.className = 'med-list-item';
        item.innerHTML = `
            <div class="med-time">${med.time}</div>
            <div class="med-details">
                <h4>${med.name}</h4>
                <p>${med.type} • ${med.dose}</p>
            </div>
            <button class="med-status ${med.taken ? 'taken' : ''}" onclick="toggleMedStatus('${med.id}')">
                ${med.taken ? '✓' : ''}
            </button>
        `;
        listContainer.appendChild(item);
    });
}

function toggleMedStatus(id) {
    const meds = getMeds();
    const medIndex = meds.findIndex(m => m.id === id);
    if (medIndex > -1) {
        meds[medIndex].taken = !meds[medIndex].taken;
        saveMeds(meds);
        renderPatientMeds();
        showNotification('Dose Registrada', `Você marcou ${meds[medIndex].name} como tomado.`, '💊');
    }
}

// --- Caregiver Logic ---

function initCaregiverView() {
    renderCaregiverDashboard();
}

function switchCaregiverTab(tab) {
    const tabs = document.querySelectorAll('.cg-tab');
    const btns = document.querySelectorAll('.sub-nav-btn');
    
    tabs.forEach(t => t.style.display = 'none');
    btns.forEach(b => b.classList.remove('active'));
    
    document.getElementById(`cg-tab-${tab}`).style.display = 'block';
    const activeBtn = Array.from(btns).find(b => b.getAttribute('onclick').includes(`'${tab}'`));
    if (activeBtn) activeBtn.classList.add('active');
    
    if (tab === 'dash') renderCaregiverDashboard();
    if (tab === 'meds') populatePatientSelect();
    if (tab === 'history') renderHistory();
}

function populatePatientSelect() {
    const patients = getPatients();
    const select = document.getElementById('mPatient');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um paciente</option>';
    patients.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = p.name;
        select.appendChild(opt);
    });
}

function renderHistory() {
    const history = getHistory();
    const container = document.getElementById('historyListContainer');
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>Nenhum histórico registrado.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    history.forEach(h => {
        const item = document.createElement('div');
        item.className = 'history-item animate-fade';
        item.style.alignItems = 'flex-start';
        item.style.padding = '1.5rem';
        item.innerHTML = `
            <div class="history-icon" style="background: var(--primary); color: white; min-width: 48px;">✓</div>
            <div class="history-info" style="width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="font-size: 1.2rem;">Paciente: ${h.patientName}</h4>
                    <span style="background: var(--primary-light); color: var(--primary); padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Dose tomada ✓</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95rem; color: var(--text);">
                    <span><strong>Medicamento:</strong> ${h.medName}</span>
                    <span><strong>Dose:</strong> ${h.medDose || '-'}</span>
                    <span><strong>Horário:</strong> ${h.medTime || '-'}</span>
                    <span><strong>Data:</strong> ${h.confirmDate || h.timestamp.split(',')[0]}</span>
                </div>
                <p style="margin-top: 12px; font-size: 0.8rem; color: var(--text-light); font-style: italic; border-top: 1px solid #eee; padding-top: 8px;">
                    Registro realizado às ${h.confirmTime || h.timestamp.split(',')[1]}
                </p>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderCaregiverDashboard() {
    const patients = getPatients();
    const meds = getGlobalMeds();
    const listContainer = document.getElementById('patientListContainer');
    const nextDoseContainer = document.getElementById('caregiverNextDose');
    
    if (!nextDoseContainer) return;

    // 1. Render Next Doses Card (Robustly)
    try {
        const medsPending = meds.filter(m => !m.taken).sort((a,b) => a.time.localeCompare(b.time));
        
        nextDoseContainer.innerHTML = `
            <div class="card-title" style="margin-bottom: 0.8rem;">
                <h3 style="font-size: 1.2rem;">Próximas Doses</h3>
            </div>
            <div class="next-doses-list" id="nextDosesList" style="text-align: left;"></div>
        `;
        
        const nextList = document.getElementById('nextDosesList');
        if (medsPending.length === 0) {
            nextList.innerHTML = `
                <div style="text-align: center; padding: 2rem 1rem; color: var(--text-light);">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.3;">✨</div>
                    <p style="font-weight: 500;">Nenhuma dose pendente no momento.</p>
                </div>
            `;
        } else {
            medsPending.slice(0, 5).forEach(med => {
                const p = patients.find(p => p.id === med.patientId);
                const item = document.createElement('div');
                item.className = 'mini-dose-item animate-fade';
                item.innerHTML = `
                    <div class="mini-dose-info">
                        <p style="font-size: 0.75rem; color: var(--primary); font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">${p ? p.name : 'Paciente'}</p>
                        <h4>${med.name}</h4>
                        <p>${med.dose} • <strong style="color: var(--text)">${med.time}</strong></p>
                    </div>
                    <button class="btn btn-primary" style="padding: 0.6rem 1rem; font-size: 0.8rem; border-radius: 12px;" onclick="confirmMedCaregiver(event, '${med.id}')">Confirmar Dose</button>
                `;
                nextList.appendChild(item);
            });
        }
    } catch (e) {
        console.error("Erro ao renderizar próximas doses:", e);
    }

    if (!listContainer) return;

    // 2. Adherence Calculation & Stats
    try {
        const avgAdherence = patients.length > 0 
            ? Math.round(patients.reduce((acc, p) => acc + (p.adherence || 0), 0) / patients.length)
            : 0;
        
        const circle = document.getElementById('adherenceCircle');
        const text = document.getElementById('adherenceText');
        if (circle && text) {
            circle.setAttribute('stroke-dasharray', `${avgAdherence}, 100`);
            text.textContent = `${avgAdherence}%`;
        }

        const today = new Date().toLocaleDateString('pt-BR');
        const history = getHistory();
        const dosesTakenToday = history.filter(h => h.timestamp.includes(today)).length;
        if(document.getElementById('statDoses')) document.getElementById('statDoses').innerText = dosesTakenToday;
        if(document.getElementById('statDelays')) document.getElementById('statDelays').innerText = meds.filter(m => !m.taken).length;
    } catch (e) {
        console.error("Erro ao calcular adesão/stats:", e);
    }

    // 3. Patient Grid (Overview)
    try {
        listContainer.innerHTML = '';
        if (patients.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; padding: 3rem;">
                    <div class="empty-state-icon" style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                    <p style="font-weight: 600; font-size: 1.1rem;">Nenhum paciente cadastrado.</p>
                    <p style="color: var(--text-light); font-size: 0.9rem;">Cadastre um paciente na aba superior para começar o monitoramento.</p>
                </div>
            `;
        } else {
            patients.forEach(p => {
                const adherence = p.adherence || 0;
                const card = document.createElement('div');
                card.className = 'card patient-card animate-fade';
                card.innerHTML = `
                    <div class="patient-badge">${adherence}% adesão</div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 0.4rem; color: var(--text);">${p.name}</h3>
                    <p style="font-size: 0.95rem; color: var(--text-light); font-weight: 500;">
                        ${p.age ? p.age + ' anos • ' : ''}${p.condition}
                    </p>
                    
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${adherence}%"></div>
                    </div>
                    
                    <div class="patient-stat-row">
                        <div class="patient-mini-stat">
                            Medicamentos
                            <strong>${meds.filter(m => m.patientId === p.id).length}</strong>
                        </div>
                        <div class="patient-mini-stat">
                            Pendentes
                            <strong style="color: ${meds.filter(m => m.patientId === p.id && !m.taken).length > 0 ? 'var(--alert)' : 'var(--text)'}">
                                ${meds.filter(m => m.patientId === p.id && !m.taken).length}
                            </strong>
                        </div>
                    </div>
                    
                    <button class="btn btn-outline" style="width: 100%; margin-top: 1.5rem; border-radius: 12px;" onclick="showPatientDetails('${p.id}')">Ver Detalhes</button>
                `;
                listContainer.appendChild(card);
            });
        }
    } catch (e) {
        console.error("Erro ao renderizar grid de pacientes:", e);
    }
}

function showPatientDetails(patientId) {
    const patients = getPatients();
    const meds = getGlobalMeds();
    const p = patients.find(p => p.id === patientId);
    
    if (!p) return;
    
    const patientMeds = meds.filter(m => m.patientId === patientId);
    const takenCount = patientMeds.filter(m => m.taken).length;
    const pendingCount = patientMeds.filter(m => !m.taken).length;
    
    document.getElementById('detName').innerText = p.name;
    const content = document.getElementById('patientDetailsContent');
    
    content.innerHTML = `
        <div class="detail-section">
            <h4>👤 Informações do Paciente</h4>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <strong>Idade</strong>
                    ${p.age || 'Não informada'} anos
                </div>
                <div class="detail-info-item">
                    <strong>Condição / Doença</strong>
                    ${p.condition}
                </div>
                <div class="detail-info-item">
                    <strong>Contato de Emergência</strong>
                    ${p.emergencyContact || 'Não cadastrado'}
                </div>
                <div class="detail-info-item">
                    <strong>Adesão Atual</strong>
                    ${p.adherence || 0}%
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>💊 Medicamentos Agendados</h4>
            ${patientMeds.length === 0 ? '<p style="color: var(--text-light); font-size: 0.9rem;">Nenhum medicamento vinculado.</p>' : ''}
            ${patientMeds.map(m => `
                <div class="med-item-detail">
                    <div>
                        <strong style="display: block; color: var(--text);">${m.name}</strong>
                        <span style="font-size: 0.85rem; color: var(--text-light);">${m.dose} • ${m.frequency}</span>
                    </div>
                    <div style="font-weight: 700; color: var(--primary);">${m.time}</div>
                </div>
            `).join('')}
        </div>

        <div class="detail-section">
            <h4>📊 Acompanhamento de Hoje</h4>
            <div class="progress-container" style="margin-bottom: 0.8rem;">
                <div class="progress-bar" style="width: ${p.adherence || 0}%"></div>
            </div>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <strong>Doses Tomadas</strong>
                    ${takenCount}
                </div>
                <div class="detail-info-item">
                    <strong>Doses Pendentes</strong>
                    ${pendingCount}
                </div>
            </div>
        </div>
    `;
    
    openModal('patientDetailsModal');
    
    const deleteBtn = document.getElementById('btnDeletePatient');
    if (deleteBtn) {
        deleteBtn.onclick = () => deletePatient(patientId);
    }
}

function deletePatient(patientId) {
    const patients = getPatients();
    const patient = patients.find(p => p.id === patientId);
    const name = patient ? patient.name : 'este paciente';

    showConfirm(
        'Excluir Paciente?',
        `Tem certeza que deseja remover ${name} e todos os seus medicamentos? Esta ação é irreversível.`,
        () => {
            let currentPatients = getPatients();
            currentPatients = currentPatients.filter(p => p.id !== patientId);
            savePatients(currentPatients);
            
            let meds = getGlobalMeds();
            meds = meds.filter(m => m.patientId !== patientId);
            saveGlobalMeds(meds);
            
            closeModal('patientDetailsModal');
            renderCaregiverDashboard();
            showNotification('Paciente Removido', `${name} foi removido com sucesso.`, '🗑️');
        }
    );
}

function confirmMedCaregiver(event, medId) {
    const meds = getGlobalMeds();
    const patients = getPatients();
    const medIndex = meds.findIndex(m => m.id === medId);
    
    if (medIndex > -1) {
        const med = meds[medIndex];
        const patient = patients.find(p => p.id === med.patientId);
        
        // Visual Feedback
        const btn = event.currentTarget;
        const card = btn.closest('.mini-dose-item');
        if (card) {
            card.classList.add('confirmed');
            const infoDiv = card.querySelector('.mini-dose-info');
            if (infoDiv) {
                const feedback = document.createElement('p');
                feedback.style.color = 'var(--primary)';
                feedback.style.fontWeight = '800';
                feedback.style.marginTop = '5px';
                feedback.style.fontSize = '0.85rem';
                feedback.innerHTML = 'Dose confirmada com sucesso ✓';
                infoDiv.appendChild(feedback);
            }
        }

        // Logic for persistence and history
        setTimeout(() => {
            med.taken = true;
            saveGlobalMeds(meds);
            
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR');
            const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            addToHistory({
                patientName: patient ? patient.name : 'Desconhecido',
                medName: med.name,
                medDose: med.dose,
                medTime: med.time,
                confirmTime: timeStr,
                confirmDate: dateStr,
                status: 'Dose tomada ✓',
                action: 'Confirmado pelo cuidador'
            });
            
            if (patient) {
                patient.adherence = Math.min(100, (patient.adherence || 0) + 5);
                savePatients(patients);
            }
            renderCaregiverDashboard();
            showNotification('Dose Confirmada', `${patient ? patient.name : 'O paciente'} tomou ${med.name} às ${timeStr}.`, '💊');
        }, 800);
    }
}

// --- Form Handlers ---

document.addEventListener('submit', (e) => {
    if (e.target.id === 'medForm') {
        e.preventDefault();
        const meds = getMeds();
        const name = document.getElementById('medName').value;
        meds.push({
            id: Date.now().toString(),
            name: name,
            type: document.getElementById('medType').value,
            dose: document.getElementById('medDose').value,
            time: document.getElementById('medTime').value,
            taken: false
        });
        saveMeds(meds);
        closeModal('medModal');
        e.target.reset();
        renderPatientMeds();
        showNotification('Sucesso', `${name} cadastrado com sucesso!`, '✨');
    }

    if (e.target.id === 'patientFormCaregiver') {
        e.preventDefault();
        const name = document.getElementById('pName').value;
        const patients = getPatients();
        patients.push({
            id: Date.now().toString(),
            name: name,
            age: document.getElementById('pAge').value,
            condition: document.getElementById('pCondition').value,
            emergencyContact: document.getElementById('pContact').value,
            adherence: 80
        });
        savePatients(patients);
        showNotification('Paciente Cadastrado', `${name} foi adicionado à sua lista.`, '👤');
        e.target.reset();
        switchCaregiverTab('dash');
    }

    if (e.target.id === 'medFormCaregiver') {
        e.preventDefault();
        const meds = getGlobalMeds();
        const patientId = document.getElementById('mPatient').value;
        const patient = getPatients().find(p => p.id === patientId);
        const medName = document.getElementById('mName').value;
        meds.push({
            id: Date.now().toString(),
            patientId: patientId,
            name: medName,
            dose: document.getElementById('mDose').value,
            time: document.getElementById('mTime').value,
            frequency: document.getElementById('mFreq').value,
            taken: false
        });
        saveGlobalMeds(meds);
        showNotification('Medicamento Vinculado', `${medName} agendado para ${patient ? patient.name : 'paciente'}.`, '💊');
        e.target.reset();
        switchCaregiverTab('dash');
    }
});

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    window.onclick = function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            event.target.style.display = 'none';
        }
    }
});