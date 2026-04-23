<?php

require_once 'model.php';
require_once 'service.php';

class MatriculaController {
    /**
     * Orquestra o processo de matrícula.
     */
    public function processarMatricula($dados) {
        try {
            // 1. Aciona o Serviço para aplicar regras de negócio
            $service = new MatriculaService();
            $dadosProcessados = $service->processar($dados);

            // 2. Se aprovado, usa o Model para persistir no banco
            $aluno = new AlunoModel();
            $aluno->setNome($dadosProcessados['nome']);
            $aluno->setIdade($dadosProcessados['idade']);
            $aluno->setCurso($dadosProcessados['curso']);

            if ($aluno->save()) {
                echo "<div style='color: green; font-family: sans-serif;'>";
                echo "<h2>✅ Matrícula Realizada com Sucesso!</h2>";
                echo "<p><strong>Nome:</strong> " . htmlspecialchars($aluno->getNome()) . "</p>";
                echo "<p><strong>Curso:</strong> " . htmlspecialchars($aluno->getCurso()) . "</p>";
                echo "<hr><a href='/'>Fazer outra matrícula</a>";
                echo "</div>";
            }
        } catch (Exception $e) {
            // Captura falhas nas regras de negócio ou banco de dados
            echo "<div style='color: red; font-family: sans-serif;'>";
            echo "<h2>❌ Erro ao Processar Matrícula</h2>";
            echo "<p>" . $e->getMessage() . "</p>";
            echo "<hr><a href='/'>Voltar e tentar novamente</a>";
            echo "</div>";
        }
    }
}
