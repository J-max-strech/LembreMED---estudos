<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>LembreMED - Carregando...</title>
    <script>
        const logged = localStorage.getItem('lembremed_logged');
        const user = JSON.parse(localStorage.getItem('lembremed_user'));

        if (!user) {
            window.location.href = 'pages/cadastro.html';
        } else if (logged !== 'true') {
            window.location.href = 'pages/login.html';
        } else if (user.role === 'paciente') {
            window.location.href = 'pages/paciente-view.html';
        } else {
            window.location.href = 'pages/inicio.html';
        }
    </script>
</head>
<body>
</body>
</html>
