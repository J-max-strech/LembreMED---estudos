// 1. O JavaScript procura no HTML quem são os elementos que ele vai controlar
const formRemedio = document.getElementById('form-remedio');
const mensagemSucesso = document.getElementById('mensagem-sucesso');

// 2. Avisamos ao JavaScript para ficar "escutando" o evento de envio (submit) do formulário
formRemedio.addEventListener('submit', function(evento) {
    
    // 3. Isso impede que a página recarregue sozinha quando clicamos no botão
    evento.preventDefault();

    // 4. Muda o estilo da mensagem verde de "escondida" (none) para "visível" (block)
    mensagemSucesso.style.display = 'block';

    // 5. Limpa todos os campos que o usuário digitou no formulário
    formRemedio.reset();

    // 6. Cria um cronômetro que espera 3 segundos (3000 milissegundos) e esconde a mensagem de novo
    setTimeout(function() {
        mensagemSucesso.style.display = 'none';
    }, 3000);
    
});