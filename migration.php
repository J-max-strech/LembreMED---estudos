<?php

require_once __DIR__ . '/Config/AppConfig.php';

class Migration {
    public static function run() {
        try {
            $config = AppConfig::load();
            $dsn = $config->get('database_dsn');
            $user = $config->get('database_user') ?: null;
            $password = $config->get('database_password') ?: null;

            // Cria ou abre o banco configurado.
            $pdo = $user === null
                ? new PDO($dsn)
                : new PDO($dsn, $user, $password);
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
            die("Erro na migração: verifique a configuração do banco de dados.\n");
        }
    }
}

// Executa a migração se o arquivo for chamado diretamente via CLI
if (php_sapi_name() === 'cli' && basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    Migration::run();
}
