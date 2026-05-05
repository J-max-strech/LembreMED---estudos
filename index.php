<?php

/**
 * Front Controller - Ponto de entrada único da aplicação.
 */

require_once 'router.php';
require_once __DIR__ . '/Config/AppConfig.php';
require_once __DIR__ . '/Repositories/PdoAlunoRepository.php';
require_once __DIR__ . '/service.php';

$config = AppConfig::load();
$dsn = $config->get('database_dsn');
$user = $config->get('database_user') ?: null;
$password = $config->get('database_password') ?: null;

$pdo = $user === null
    ? new PDO($dsn)
    : new PDO($dsn, $user, $password);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$alunos = new PdoAlunoRepository($pdo);
$matriculas = new MatriculaService($alunos);
$controller = new MatriculaController($matriculas);
$middleware = new Middleware();

// Inicia o roteamento com dependências já montadas.
$router = new Router($controller, $middleware);
$router->route();
