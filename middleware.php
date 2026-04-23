<?php

class Middleware {
    /**
     * Valida os dados básicos antes de chegarem ao Controller.
     */
    public static function validar($dados) {
        // Verifica campos vazios
        if (empty($dados['nome']) || empty($dados['idade']) || empty($dados['curso'])) {
            die("<h3>⚠️ Aviso do Middleware:</h3><p>Todos os campos (Nome, Idade, Curso) devem ser preenchidos!</p><a href='/'>Voltar</a>");
        }

        // Verifica se a idade é um número válido
        if (!is_numeric($dados['idade']) || $dados['idade'] <= 0) {
            die("<h3>⚠️ Aviso do Middleware:</h3><p>A idade deve ser um número válido e maior que zero!</p><a href='/'>Voltar</a>");
        }
    }
}
