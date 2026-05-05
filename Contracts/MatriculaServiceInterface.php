<?php

interface MatriculaServiceInterface {
    public function processar(array $dados): AlunoModel;
}
