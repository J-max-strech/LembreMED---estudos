/* =========================================================================
   db.js - Mini Framework IndexedDB (Atualizado para Múltiplas Tabelas)
   ========================================================================= */

const DB_NAME = 'BancoLembreMED';
const DB_VERSION = 2; // Mudamos para 2 para forçar o banco a se atualizar!

function iniciarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (evento) => {
            const db = evento.target.result;
            
            // Tabela 1: Remédios
            if (!db.objectStoreNames.contains('remedios')) {
                db.createObjectStore('remedios', { keyPath: 'id', autoIncrement: true });
                console.log('✅ Tabela de remédios pronta!');
            }
            
            // Tabela 2: Pacientes (NOVA)
            if (!db.objectStoreNames.contains('pacientes')) {
                db.createObjectStore('pacientes', { keyPath: 'id', autoIncrement: true });
                console.log('✅ Tabela de pacientes criada com sucesso!');
            }
        };

        request.onsuccess = (evento) => resolve(evento.target.result);
        request.onerror = (evento) => reject(evento.target.error);
    });
}

// Repare que agora adicionamos a variável 'tabela' como primeiro parâmetro
async function adicionarItem(tabela, item) {
    const db = await iniciarBanco();
    return new Promise((resolve, reject) => {
        const transacao = db.transaction([tabela], 'readwrite');
        const store = transacao.objectStore(tabela);
        const request = store.add(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (evento) => reject(evento.target.error);
    });
}

async function buscarItens(tabela) {
    const db = await iniciarBanco();
    return new Promise((resolve, reject) => {
        const transacao = db.transaction([tabela], 'readonly');
        const store = transacao.objectStore(tabela);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (evento) => reject(evento.target.error);
    });
}

async function deletarItem(tabela, id) {
    const db = await iniciarBanco();
    return new Promise((resolve, reject) => {
        const transacao = db.transaction([tabela], 'readwrite');
        const store = transacao.objectStore(tabela);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = (evento) => reject(evento.target.error);
    });
}
