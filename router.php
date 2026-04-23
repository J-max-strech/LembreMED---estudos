<?php

require_once 'controller.php';
require_once 'middleware.php';

class Router {
    /**
     * Avalia a URL e o método HTTP para direcionar a requisição.
     */
    public function route() {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_SERVER['REQUEST_URI'];

        // Roteamento simples baseado no método
        if ($method === 'GET') {
            // Exibe o formulário
            include 'view.php';
        } elseif ($method === 'POST') {
            // 1. Passa pelo Middleware de Segurança/Validação
            Middleware::validar($_POST);

            // 2. Aciona o Controller para processar os dados
            $controller = new MatriculaController();
            $controller->processarMatricula($_POST);
        } else {
            http_response_code(405);
            echo "Método não permitido.";
        }
    }
}
