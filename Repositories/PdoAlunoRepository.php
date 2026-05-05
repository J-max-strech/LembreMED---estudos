<?php

require_once __DIR__ . '/../Contracts/AlunoRepositoryInterface.php';
require_once __DIR__ . '/../Exceptions/DatabaseException.php';
require_once __DIR__ . '/../model.php';

class PdoAlunoRepository implements AlunoRepositoryInterface {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(AlunoModel $aluno): bool {
        try {
            $stmt = $this->pdo->prepare(
                'INSERT INTO alunos (nome, idade, curso) VALUES (:nome, :idade, :curso)'
            );

            return $stmt->execute([
                ':nome' => $aluno->getNome(),
                ':idade' => $aluno->getIdade(),
                ':curso' => $aluno->getCurso(),
            ]);
        } catch (PDOException $e) {
            throw new DatabaseException('Não foi possível salvar a matrícula. Tente novamente mais tarde.', 0, $e);
        }
    }
}
