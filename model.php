<?php

class AlunoModel {
    private string $nome;
    private int $idade;
    private string $curso;

    public function __construct(string $nome = '', int $idade = 0, string $curso = '') {
        $this->nome = $nome;
        $this->idade = $idade;
        $this->curso = $curso;
    }

    // Getters e Setters
    public function getNome(): string { return $this->nome; }
    public function setNome(string $nome): void { $this->nome = $nome; }

    public function getIdade(): int { return $this->idade; }
    public function setIdade(int $idade): void { $this->idade = $idade; }

    public function getCurso(): string { return $this->curso; }
    public function setCurso(string $curso): void { $this->curso = $curso; }
}
