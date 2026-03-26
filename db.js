// db.js - Configuração do IndexedDB para o LembreMED

const dbName = "LembreMedDB";
const dbVersion = 1;
let db;

// Abre (ou cria) o banco de dados
const request = indexedDB.open(dbName, dbVersion);

// Evento disparado se a versão mudar ou o banco for criado pela primeira vez
request.onupgradeneeded = (event) => {
    db = event.target.result;

    // Criar Tabela de Pacientes
    if (!db.objectStoreNames.contains("pacientes")) {
        db.createObjectStore("pacientes", { keyPath: "id", autoIncrement: true });
        console.log("Tabela 'pacientes' criada.");
    }

    // Criar Tabela de Medicamentos
    if (!db.objectStoreNames.contains("medicamentos")) {
        db.createObjectStore("medicamentos", { keyPath: "id", autoIncrement: true });
        console.log("Tabela 'medicamentos' criada.");
    }

    // Criar Tabela de Histórico
    if (!db.objectStoreNames.contains("historico")) {
        db.createObjectStore("historico", { keyPath: "id", autoIncrement: true });
        console.log("Tabela 'historico' criada.");
    }

    // Criar Tabela de Doenças
    if (!db.objectStoreNames.contains("doencas")) {
        db.createObjectStore("doencas", { keyPath: "id", autoIncrement: true });
        console.log("Tabela 'doencas' criada.");
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Banco de dados LembreMedDB aberto com sucesso.");
};

request.onerror = (event) => {
    console.error("Erro ao abrir o banco de dados:", event.target.errorCode);
};
