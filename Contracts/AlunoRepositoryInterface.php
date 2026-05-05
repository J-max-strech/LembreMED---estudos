<?php

interface AlunoRepositoryInterface {
    public function salvar(AlunoModel $aluno): bool;
}
