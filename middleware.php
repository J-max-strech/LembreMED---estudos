<?php

require_once __DIR__ . '/Exceptions/ValidationException.php';

class Middleware {
    /**
     * Valida os dados básicos antes de chegarem ao Controller.
     */
    public function validar(array $dados): void {
        // Verifica campos vazios
        if (empty($dados['nome']) || empty($dados['idade']) || empty($dados['curso'])) {
            throw new ValidationException('Todos os campos (Nome, Idade, Curso) devem ser preenchidos.');
        }

        // Verifica se a idade é um número válido
        if (!is_numeric($dados['idade']) || $dados['idade'] <= 0) {
            throw new ValidationException('A idade deve ser um número válido e maior que zero.');
        }
    }
}
