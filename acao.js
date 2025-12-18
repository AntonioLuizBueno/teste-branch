/*script.js*/
// ATENÇÃO: É necessário que este script seja carregado como um módulo no HTML:
// <script type="module" src="script.js"></script>

document.addEventListener('DOMContentLoaded', function () {
    const loadButton = document.getElementById('load-module');
    const statusEl = document.getElementById('module-status');
    const resultEl = document.getElementById('calculation-result');

    loadButton.addEventListener('click', async function () {
        // Desativa o botão para evitar múltiplos cliques
        loadButton.disabled = true;
        loadButton.textContent = 'Carregando módulo...';
        statusEl.textContent = 'Iniciando download do módulo (olhe a aba Network)...';

        try {
            // Este é o Import Dinâmico, que dispara a requisição de rede
            const heavyModule = await import('./heavy-module.js');

            statusEl.textContent = 'Módulo carregado e analisado. Executando cálculo...';

            // Chama a função exportada do módulo
            const result = heavyModule.performHeavyCalculation();

            resultEl.textContent = `Resultado: ${result}`;
            statusEl.textContent = 'Cálculo finalizado com sucesso.';

        } catch (error) {
            statusEl.textContent = 'Erro ao carregar o módulo.';
            console.error('Falha no Code Splitting:', error);
        } finally {
            loadButton.textContent = 'Módulo Executado!';
        }
    });

    console.log('Script principal (script.js) executado na inicialização.');
});