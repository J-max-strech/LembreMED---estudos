<?php

require_once 'model.php';
require_once 'service.php';

class MatriculaController {
    /**
     * Orquestra o processo de matrícula com feedback visual melhorado.
     */
    public function processarMatricula($dados) {
        // Estilos CSS compartilhados para as telas de resposta
        $style = "
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 400px; width: 100%; text-align: center; }
                h2 { margin-top: 0; font-size: 20px; }
                p { color: #64748b; margin: 10px 0; }
                .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
                .success-icon { color: #22c55e; font-size: 48px; margin-bottom: 10px; }
                .error-icon { color: #ef4444; font-size: 48px; margin-bottom: 10px; }
            </style>
            <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' rel='stylesheet'>
        ";

        try {
            $service = new MatriculaService();
            $dadosProcessados = $service->processar($dados);

            $aluno = new AlunoModel();
            $aluno->setNome($dadosProcessados['nome']);
            $aluno->setIdade($dadosProcessados['idade']);
            $aluno->setCurso($dadosProcessados['curso']);

            if ($aluno->save()) {
                echo $style;
                echo "<div class='card'>";
                echo "<div class='success-icon'>✓</div>";
                echo "<h2>Matrícula Confirmada!</h2>";
                echo "<p>O aluno <strong>" . htmlspecialchars($aluno->getNome()) . "</strong> foi registrado com sucesso no curso de <strong>" . htmlspecialchars($aluno->getCurso()) . "</strong>.</p>";
                echo "<a href='/' class='btn'>Nova Matrícula</a>";
                echo "</div>";
            }
        } catch (Exception $e) {
            echo $style;
            echo "<div class='card'>";
            echo "<div class='error-icon'>✕</div>";
            echo "<h2>Não foi possível matricular</h2>";
            echo "<p>" . $e->getMessage() . "</p>";
            echo "<a href='/' class='btn' style='background: #64748b;'>Tentar Novamente</a>";
            echo "</div>";
        }
    }
}
