📘 Resumo – Introdução ao HTML
📌 O que é HTML?

HTML significa HyperText Markup Language (Linguagem de Marcação de Hipertexto).

O HTML não é uma linguagem de programação, pois ele não possui lógica, laços de repetição ou estruturas condicionais.
Ele é uma linguagem de marcação, usada para estruturar e organizar o conteúdo de páginas na web.

Com o HTML, conseguimos definir:

Títulos

Parágrafos

Links

Imagens

Listas

Estrutura da página

Ele funciona através de tags, que indicam ao navegador como o conteúdo deve ser exibido.

🏗 Anatomia das Tags

Uma tag HTML normalmente possui:

<nome-da-tag> conteúdo </nome-da-tag>

Ela é composta por:

Tag de abertura

Conteúdo

Tag de fechamento

Exemplo:

<p>Este é um parágrafo</p>

Algumas tags não possuem fechamento, como:

<img src="imagem.jpg">
📄 Estrutura Básica de um Documento HTML

Todo documento HTML deve começar com a seguinte estrutura obrigatória:

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Título da Página</title>
</head>
<body>

    Conteúdo da página

</body>
</html>
Explicação:

<!DOCTYPE html> → Informa ao navegador que estamos usando HTML5.

<html> → Elemento raiz da página.

<head> → Contém configurações e metadados.

<body> → Onde fica o conteúdo visível da página.

📚 Glossário das Principais Tags
🔹 Títulos

<h1> → Título principal (mais importante)

<h2> → Subtítulo

<h3> até <h6> → Títulos de menor importância

Exemplo:

<h1>Título Principal</h1>
🔹 Parágrafo

<p> → Define um parágrafo de texto.

<p>Este é um texto em parágrafo.</p>
🔹 Link

<a> → Cria um link.

Usa o atributo href para definir o destino.

<a href="https://github.com">Ir para o GitHub</a>
🔹 Imagem

<img> → Insere uma imagem.

Usa o atributo src para indicar o caminho da imagem.

Usa o atributo alt para descrever a imagem.

<img src="imagem.jpg" alt="Descrição da imagem">
🔹 Div

<div> → Serve para organizar e agrupar elementos.

Muito usada para estruturar o layout da página.

Ajuda no aninhamento e na organização do código.

Exemplo:

<div>
    <h2>Seção</h2>
    <p>Texto dentro da seção.</p>
</div>

A div não tem significado semântico próprio, mas é essencial para organização e estilização com CSS.

📦 Aninhamento de Tags

Aninhamento significa colocar uma tag dentro da outra.

Exemplo correto:

<div>
    <p>Texto dentro da div</p>
</div>

É importante manter a organização e fechar as tags corretamente.