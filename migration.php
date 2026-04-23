<?php

class Migration {
    public static function run() {
        try {
            // Cria ou abre o banco de dados SQLite
            $pdo = new PDO('sqlite:database.sqlite');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // SQL para criação da tabela
            $sql = "CREATE TABLE IF NOT EXISTS alunos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                idade INTEGER,
                curso TEXT
            )";

            $pdo->exec($sql);
            echo "Sucesso: Banco de dados inicializado e tabela 'alunos' pronta.\n";
        } catch (PDOException $e) {
            die("Erro na migração: " . $e->getMessage() . "\n");
        }
    }
}

// Executa a migração se o arquivo for chamado diretamente via CLI
if (php_sapi_name() === 'cli' && basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    Migration::run();
}
