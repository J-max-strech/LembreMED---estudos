<?php

class MatriculaService {
    /**
     * Aplica regras de negócio para a matrícula.
     * @throws Exception se as regras falharem.
     */
    public function processar(array $dados) {
        $nome = $dados['nome'];
        $idade = (int)$dados['idade'];
        $curso = $dados['curso'];

        // Regra: Idade mínima de 16 anos para qualquer curso
        if ($idade < 16) {
            throw new Exception("Regra de Negócio: O aluno deve ter pelo menos 16 anos para realizar a matrícula.");
        }

        // Regra de Especialização: Lógica de bolsa de estudos automática para maiores de 50 anos
        if ($idade >= 50) {
            $curso .= " (Matrícula com Bolsa Sênior 50%)";
        }

        return [
            'nome' => $nome,
            'idade' => $idade,
            'curso' => $curso
        ];
    }
}
