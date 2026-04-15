/**
 * db.js - Mini framework para IndexedDB usando Promises e async/await.
 * Este arquivo fornece funções globais para interagir com o banco de dados.
 */

const dbName = "LembreMedDB";
const dbVersion = 1;
let db;

/**
 * Inicia o banco de dados IndexedDB.
 * @returns {Promise<IDBDatabase>} Uma Promise que resolve com a instância do banco de dados.
 */
function iniciarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Criar Tabela de Pacientes
            if (!db.objectStoreNames.contains("pacientes")) {
                db.createObjectStore("pacientes", { keyPath: "id", autoIncrement: true });
            }
            // Criar Tabela de Medicamentos
            if (!db.objectStoreNames.contains("medicamentos")) {
                db.createObjectStore("medicamentos", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("Erro ao abrir IndexedDB:", event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Adiciona um item a uma tabela específica.
 * @param {string} tabela Nome da store (ex: 'medicamentos').
 * @param {object} item Objeto a ser salvo.
 * @returns {Promise<number>} ID do item inserido.
 */
async function adicionarItem(tabela, item) {
    if (!db) await iniciarBanco();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([tabela], "readwrite");
        const store = transaction.objectStore(tabela);
        const request = store.add(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Busca todos os itens de uma tabela.
 * @param {string} tabela Nome da store.
 * @returns {Promise<Array>} Lista de objetos encontrados.
 */
async function buscarItens(tabela) {
    if (!db) await iniciarBanco();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([tabela], "readonly");
        const store = transaction.objectStore(tabela);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Deleta um item de uma tabela pelo seu ID.
 * @param {string} tabela Nome da store.
 * @param {number} id ID do item a ser removido.
 * @returns {Promise<boolean>} Sucesso da operação.
 */
async function deletarItem(tabela, id) {
    if (!db) await iniciarBanco();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([tabela], "readwrite");
        const store = transaction.objectStore(tabela);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Atualiza um item em uma tabela (ou adiciona se não existir).
 * @param {string} tabela Nome da store.
 * @param {object} item Objeto com ID para atualizar.
 * @returns {Promise<boolean>} Sucesso da operação.
 */
async function atualizarItem(tabela, item) {
    if (!db) await iniciarBanco();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([tabela], "readwrite");
        const store = transaction.objectStore(tabela);
        const request = store.put(item);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}
