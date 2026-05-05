<?php

require_once 'controller.php';
require_once 'middleware.php';

class Router {
    private MatriculaController $controller;
    private Middleware $middleware;

    public function __construct(MatriculaController $controller, Middleware $middleware) {
        $this->controller = $controller;
        $this->middleware = $middleware;
    }

    /**
     * Avalia a URL e o método HTTP para direcionar a requisição.
     */
    public function route(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_SERVER['REQUEST_URI'];

        try {
            // Roteamento simples baseado no método
            if ($method === 'GET') {
                // Exibe o formulário
                include 'view.php';
            } elseif ($method === 'POST') {
                // 1. Passa pelo Middleware de Segurança/Validação
                $this->middleware->validar($_POST);

                // 2. Aciona o Controller para processar os dados
                $this->controller->processarMatricula($_POST);
            } else {
                http_response_code(405);
                echo "Método não permitido.";
            }
        } catch (AppException $e) {
            $this->controller->renderErro($e->getMessage());
        } catch (Throwable $e) {
            http_response_code(500);
            $this->controller->renderErro('Erro inesperado. Tente novamente mais tarde.');
        }
    }
}
