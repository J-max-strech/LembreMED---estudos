<?php

require_once 'model.php';
require_once __DIR__ . '/Contracts/MatriculaServiceInterface.php';
require_once __DIR__ . '/Exceptions/AppException.php';

class MatriculaController {
    private MatriculaServiceInterface $matriculas;

    public function __construct(MatriculaServiceInterface $matriculas) {
        $this->matriculas = $matriculas;
    }

    /**
     * Orquestra o processo de matrícula com feedback visual melhorado.
     */
    public function processarMatricula(array $dados): void {
        try {
            $aluno = $this->matriculas->processar($dados);

            $this->renderSucesso($aluno);
        } catch (AppException $e) {
            $this->renderErro($e->getMessage());
        }
    }

    public function renderErro(string $mensagem): void {
        echo $this->style();
        echo "<div class='card'>";
        echo "<div class='error-icon'>✕</div>";
        echo "<h2>Não foi possível matricular</h2>";
        echo "<p>" . htmlspecialchars($mensagem) . "</p>";
        echo "<a href='/' class='btn' style='background: #64748b;'>Tentar Novamente</a>";
        echo "</div>";
    }

    private function renderSucesso(AlunoModel $aluno): void {
        echo $this->style();
        echo "<div class='card'>";
        echo "<div class='success-icon'>✓</div>";
        echo "<h2>Matrícula Confirmada!</h2>";
        echo "<p>O aluno <strong>" . htmlspecialchars($aluno->getNome()) . "</strong> foi registrado com sucesso no curso de <strong>" . htmlspecialchars($aluno->getCurso()) . "</strong>.</p>";
        echo "<a href='/' class='btn'>Nova Matrícula</a>";
        echo "</div>";
    }

    private function style(): string {
        return "
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 400px; width: 100%; text-align: center; }
                h2 { margin-top: 0; font-size: 20px; }
                p { color: #64748b; margin: 10px 0; }
                .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #22c55e; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
                .success-icon { color: #22c55e; font-size: 48px; margin-bottom: 10px; }
                .error-icon { color: #ef4444; font-size: 48px; margin-bottom: 10px; }
            </style>
            <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' rel='stylesheet'>
        ";
    }
}
