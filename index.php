<?php

/**
 * Front Controller - Ponto de entrada único da aplicação.
 */

require_once 'router.php';

// Inicia o roteamento
$router = new Router();
$router->route();
