<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LembreMED - Matrícula de Alunos</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        h1 { color: #2c3e50; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
        button { width: 100%; padding: 10px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background-color: #2980b9; }
    </style>
</head>
<body>
    <h1>Matrícula de Aluno</h1>
    <form action="/" method="POST">
        <div class="form-group">
            <label for="nome">Nome Completo:</label>
            <input type="text" id="nome" name="nome" placeholder="Digite o nome do aluno">
        </div>
        <div class="form-group">
            <label for="idade">Idade:</label>
            <input type="number" id="idade" name="idade" placeholder="Ex: 20">
        </div>
        <div class="form-group">
            <label for="curso">Curso:</label>
            <input type="text" id="curso" name="curso" placeholder="Ex: Sistemas de Informação">
        </div>
        <button type="submit">Finalizar Matrícula</button>
    </form>
</body>
</html>
