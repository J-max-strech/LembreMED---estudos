<?php

class AlunoModel {
    private $nome;
    private $idade;
    private $curso;

    // Getters e Setters
    public function getNome() { return $this->nome; }
    public function setNome($nome) { $this->nome = $nome; }

    public function getIdade() { return $this->idade; }
    public function setIdade($idade) { $this->idade = (int)$idade; }

    public function getCurso() { return $this->curso; }
    public function setCurso($curso) { $this->curso = $curso; }

    /**
     * Salva os dados do objeto no banco de dados SQLite.
     * Utiliza Prepared Statements para segurança.
     */
    public function save() {
        try {
            $pdo = new PDO('sqlite:database.sqlite');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $stmt = $pdo->prepare("INSERT INTO alunos (nome, idade, curso) VALUES (:nome, :idade, :curso)");
            $stmt->bindParam(':nome', $this->nome);
            $stmt->bindParam(':idade', $this->idade);
            $stmt->bindParam(':curso', $this->curso);

            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Erro ao salvar no banco de dados: " . $e->getMessage());
        }
    }
}
