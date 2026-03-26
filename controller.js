/**
 * controller.js - Ponte entre o HTML e o Banco de Dados (IndexedDB).
 * Responsável por capturar eventos de formulário e gerenciar a exibição dos dados.
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Controlador carregado.");
    
    // Inicia o banco de dados assim que a página carrega
    try {
        await iniciarBanco();
        console.log("Banco pronto para uso.");
        
        // Se houver uma lista na tela, exibe os dados salvos
        listarDados();
    } catch (err) {
        console.error("Falha ao iniciar banco no controller:", err);
    }

    // Escuta o envio do formulário de medicamentos (se existir na página)
    const medForm = document.getElementById('medFormCaregiver');
    if (medForm) {
        medForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Formulário capturado!");

            // Captura os dados do formulário
            const novoMedicamento = {
                paciente: document.getElementById('mPatient').value,
                nome: document.getElementById('mName').value,
                dose: document.getElementById('mDose').value,
                horario: document.getElementById('mTime').value,
                frequencia: document.getElementById('mFreq').value,
                dataCadastro: new Date().toISOString()
            };

            try {
                // Envia para a função de salvar do db.js
                const id = await adicionarItem('medicamentos', novoMedicamento);
                console.log("Medicamento salvo com sucesso! ID:", id);
                
                // Limpa o formulário
                medForm.reset();
                
                // Atualiza a listagem na tela
                listarDados();
                
                alert("Medicamento cadastrado com sucesso!");
            } catch (err) {
                console.error("Erro ao salvar medicamento:", err);
            }
        });
    }
});

/**
 * Busca os dados no IndexedDB e exibe no console (ou em uma lista no HTML se existir).
 */
async function listarDados() {
    try {
        const medicamentos = await buscarItens('medicamentos');
        console.log("Lista de Medicamentos Atualizada:", medicamentos);

        // Opcional: Renderizar em algum container se existir na página
        const container = document.getElementById('listaMedicamentosDB');
        if (container) {
            container.innerHTML = ""; // Limpa antes de renderizar
            medicamentos.forEach(med => {
                const item = document.createElement('div');
                item.className = 'card-item'; // Usando classe genérica do projeto
                item.innerHTML = `
                    <strong>${med.nome}</strong> (${med.dose}) - ${med.horario}<br>
                    <small>Paciente: ${med.paciente} | Frequência: ${med.frequencia}</small>
                    <button onclick="removerItem(${med.id})">Remover</button>
                `;
                container.appendChild(item);
            });
        }
    } catch (err) {
        console.error("Erro ao listar dados:", err);
    }
}

/**
 * Função global para remover item e atualizar a tela
 */
async function removerItem(id) {
    if (confirm("Deseja realmente excluir este item?")) {
        try {
            await deletarItem('medicamentos', id);
            console.log("Item removido:", id);
            listarDados();
        } catch (err) {
            console.error("Erro ao remover item:", err);
        }
    }
}
