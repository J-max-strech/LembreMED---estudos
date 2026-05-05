<?php

require_once __DIR__ . '/../Contracts/AlunoRepositoryInterface.php';
require_once __DIR__ . '/../Contracts/MatriculaServiceInterface.php';
require_once __DIR__ . '/../Exceptions/BusinessRuleException.php';
require_once __DIR__ . '/../model.php';

class MatriculaService implements MatriculaServiceInterface {
    private AlunoRepositoryInterface $alunos;

    public function __construct(AlunoRepositoryInterface $alunos) {
        $this->alunos = $alunos;
    }

    public function processar(array $dados): AlunoModel {
        $nome = trim($dados['nome']);
        $idade = (int)$dados['idade'];
        $curso = trim($dados['curso']);

        if ($idade < 16) {
            throw new BusinessRuleException('O aluno deve ter pelo menos 16 anos para realizar a matrícula.');
        }

        if ($idade >= 50) {
            $curso .= ' (Matrícula com Bolsa Sênior 50%)';
        }

        $aluno = new AlunoModel($nome, $idade, $curso);
        $this->alunos->salvar($aluno);

        return $aluno;
    }
}
