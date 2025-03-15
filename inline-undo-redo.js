/**
 * Script inline para adicionar botões de undo/redo diretamente no HTML
 */
(function() {
    // Criar os botões agora
    addUndoRedoButtons();
    
    // Variáveis para o histórico
    let canvasHistory = [];
    let currentHistoryIndex = -1;
    const maxHistorySteps = 30;
    
    // Função principal para adicionar botões
    function addUndoRedoButtons() {
        console.log("Adicionando botões de undo/redo");
        
        // Verificar se os botões já existem
        if (document.getElementById('inlineUndoButton')) {
            console.log("Botões já existem");
            return;
        }
        
        // Localizar o botão de cor ou outro ponto de referência
        const colorButton = document.getElementById('colorButton');
        
        if (colorButton) {
            // Criar container para os botões
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'inlineUndoRedoContainer';
            buttonContainer.style.display = 'inline-block';
            buttonContainer.style.marginLeft = '10px';
            
            // Criar e adicionar botões ao container
            const undoButton = createUndoButton();
            const redoButton = createRedoButton();
            buttonContainer.appendChild(undoButton);
            buttonContainer.appendChild(redoButton);
            
            // Inserir após o botão de cor
            console.log("Inserindo botões após o botão de cor");
            colorButton.parentNode.insertBefore(buttonContainer, colorButton.nextSibling);
        } else {
            console.log("Botão de cor não encontrado, adicionando diretamente ao formulário");
            
            // Procurar uma toolbar ou área de botões
            const toolbar = document.querySelector('.toolbar') || 
                           document.querySelector('.editor-controls') || 
                           document.querySelector('#toolbarContainer');
            
            if (toolbar) {
                console.log("Toolbar encontrada, adicionando botões");
                
                // Criar container para os botões
                const buttonContainer = document.createElement('div');
                buttonContainer.id = 'inlineUndoRedoContainer';
                buttonContainer.style.display = 'inline-block';
                buttonContainer.style.margin = '0 10px';
                
                // Criar e adicionar botões ao container
                const undoButton = createUndoButton();
                const redoButton = createRedoButton();
                buttonContainer.appendChild(undoButton);
                buttonContainer.appendChild(redoButton);
                
                // Adicionar à toolbar
                toolbar.appendChild(buttonContainer);
            } else {
                console.log("Nenhuma toolbar encontrada, adicionando ao topo da página");
                
                // Criar toolbar
                const newToolbar = document.createElement('div');
                newToolbar.id = 'undoRedoToolbar';
                newToolbar.style.padding = '10px';
                newToolbar.style.backgroundColor = '#f8f9fa';
                newToolbar.style.border = '1px solid #ddd';
                newToolbar.style.borderRadius = '4px';
                newToolbar.style.margin = '10px';
                newToolbar.style.display = 'flex';
                newToolbar.style.alignItems = 'center';
                
                // Criar e adicionar botões à toolbar
                const undoButton = createUndoButton();
                const redoButton = createRedoButton();
                newToolbar.appendChild(undoButton);
                newToolbar.appendChild(redoButton);
                
                // Adicionar rótulo à toolbar
                const label = document.createElement('span');
                label.textContent = 'Histórico: ';
                label.style.marginRight = '10px';
                newToolbar.insertBefore(label, undoButton);
                
                // Adicionar ao corpo do documento antes do canvas
                const canvas = document.getElementById('c');
                if (canvas && canvas.parentNode) {
                    canvas.parentNode.insertBefore(newToolbar, canvas);
                } else {
                    // Adicionar ao início do corpo
                    document.body.insertBefore(newToolbar, document.body.firstChild);
                }
            }
        }
        
        // Inicializar o sistema quando o canvas estiver pronto
        waitForCanvas();
    }
    
    // Criar botão de desfazer
    function createUndoButton() {
        const undoButton = document.createElement('button');
        undoButton.id = 'inlineUndoButton';
        undoButton.title = 'Desfazer (Ctrl+Z)';
        undoButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h10c4 0 7 3 7 7v0c0 4-3 7-7 7H9"></path><path d="M3 10l5-5"></path><path d="M3 10l5 5"></path></svg>';
        undoButton.style.padding = '6px';
        undoButton.style.backgroundColor = '#f8f9fa';
        undoButton.style.border = '1px solid #ddd';
        undoButton.style.borderRadius = '4px';
        undoButton.style.margin = '0 5px';
        undoButton.style.cursor = 'pointer';
        undoButton.disabled = true;
        undoButton.style.opacity = '0.5';
        
        // Adicionar evento de clique
        undoButton.addEventListener('click', function(e) {
            e.preventDefault();
            undoAction();
        });
        
        return undoButton;
    }
    
    // Criar botão de refazer
    function createRedoButton() {
        const redoButton = document.createElement('button');
        redoButton.id = 'inlineRedoButton';
        redoButton.title = 'Refazer (Ctrl+Y)';
        redoButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10H11c-4 0-7 3-7 7v0c0 4 3 7 7 7h4"></path><path d="M21 10l-5-5"></path><path d="M21 10l-5 5"></path></svg>';
        redoButton.style.padding = '6px';
        redoButton.style.backgroundColor = '#f8f9fa';
        redoButton.style.border = '1px solid #ddd';
        redoButton.style.borderRadius = '4px';
        redoButton.style.margin = '0 5px';
        redoButton.style.cursor = 'pointer';
        redoButton.disabled = true;
        redoButton.style.opacity = '0.5';
        
        // Adicionar evento de clique
        redoButton.addEventListener('click', function(e) {
            e.preventDefault();
            redoAction();
        });
        
        return redoButton;
    }
    
    // Função para esperar o canvas estar pronto
    function waitForCanvas() {
        console.log("Aguardando canvas estar pronto");
        
        // Verificar agora
        if (typeof canvas !== 'undefined' && canvas && canvas.on) {
            console.log("Canvas já está pronto");
            initializeHistory();
            return;
        }
        
        // Verificar a cada 500ms
        let attempts = 0;
        const checkInterval = setInterval(function() {
            attempts++;
            if (typeof canvas !== 'undefined' && canvas && canvas.on) {
                console.log("Canvas encontrado após " + attempts + " tentativas");
                clearInterval(checkInterval);
                initializeHistory();
            } else if (attempts >= 20) {
                console.error("Canvas não encontrado após 20 tentativas");
                clearInterval(checkInterval);
            }
        }, 500);
    }
    
    // Inicializar o sistema de histórico
    function initializeHistory() {
        console.log("Inicializando sistema de histórico");
        
        // Registrar eventos do canvas
        registerCanvasEvents();
        
        // Salvar estado inicial
        saveCanvasState();
        
        // Adicionar atalhos de teclado
        document.addEventListener('keydown', function(event) {
            if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                if (event.ctrlKey && event.key === 'z') {
                    event.preventDefault();
                    undoAction();
                }
                
                if (event.ctrlKey && event.key === 'y') {
                    event.preventDefault();
                    redoAction();
                }
            }
        });
        
        console.log("Sistema de histórico inicializado com sucesso");
    }
    
    // Registrar eventos do canvas
    function registerCanvasEvents() {
        console.log("Registrando eventos do canvas");
        
        // Eventos com salvamento imediato
        const immediateEvents = [
            'object:added',
            'object:removed',
            'object:modified',
            'path:created',
            'selection:cleared'
        ];
        
        immediateEvents.forEach(function(eventName) {
            canvas.on(eventName, function() {
                saveCanvasState();
            });
        });
        
        // Eventos com debounce
        const debouncedEvents = [
            'object:moving',
            'object:scaling',
            'object:rotating',
            'object:skewing'
        ];
        
        let debounceTimer = null;
        debouncedEvents.forEach(function(eventName) {
            canvas.on(eventName, function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(saveCanvasState, 300);
            });
        });
    }
    
    // Salvar estado do canvas
    function saveCanvasState() {
        try {
            const json = canvas.toJSON(['id', 'selectable']);
            const state = JSON.stringify(json);
            
            // Verificar se é igual ao último estado
            if (currentHistoryIndex >= 0 && canvasHistory[currentHistoryIndex] === state) {
                return;
            }
            
            // Se estamos no meio do histórico, remover estados futuros
            if (currentHistoryIndex < canvasHistory.length - 1) {
                canvasHistory = canvasHistory.slice(0, currentHistoryIndex + 1);
            }
            
            // Adicionar novo estado
            canvasHistory.push(state);
            currentHistoryIndex = canvasHistory.length - 1;
            
            // Limitar tamanho do histórico
            if (canvasHistory.length > maxHistorySteps) {
                canvasHistory.shift();
                currentHistoryIndex--;
            }
            
            // Atualizar estado dos botões
            updateButtonStates();
        } catch (error) {
            console.error("Erro ao salvar estado:", error);
        }
    }
    
    // Atualizar estado dos botões
    function updateButtonStates() {
        const undoButton = document.getElementById('inlineUndoButton');
        const redoButton = document.getElementById('inlineRedoButton');
        
        if (undoButton) {
            undoButton.disabled = currentHistoryIndex <= 0;
            undoButton.style.opacity = undoButton.disabled ? '0.5' : '1';
        }
        
        if (redoButton) {
            redoButton.disabled = currentHistoryIndex >= canvasHistory.length - 1;
            redoButton.style.opacity = redoButton.disabled ? '0.5' : '1';
        }
    }
    
    // Carregar estado do canvas
    function loadCanvasState(index) {
        try {
            if (index < 0 || index >= canvasHistory.length) {
                return;
            }
            
            // Desativar eventos temporariamente
            canvas.off();
            
            // Carregar estado
            canvas.loadFromJSON(JSON.parse(canvasHistory[index]), function() {
                // Atualizar índice atual
                currentHistoryIndex = index;
                
                // Renderizar canvas
                canvas.renderAll();
                
                // Reativar eventos
                registerCanvasEvents();
                
                // Atualizar botões
                updateButtonStates();
            });
        } catch (error) {
            console.error("Erro ao carregar estado:", error);
        }
    }
    
    // Função para desfazer
    function undoAction() {
        if (currentHistoryIndex <= 0) {
            console.log("Não há ações para desfazer");
            return;
        }
        
        console.log("Desfazendo ação");
        loadCanvasState(currentHistoryIndex - 1);
    }
    
    // Função para refazer
    function redoAction() {
        if (currentHistoryIndex >= canvasHistory.length - 1) {
            console.log("Não há ações para refazer");
            return;
        }
        
        console.log("Refazendo ação");
        loadCanvasState(currentHistoryIndex + 1);
    }
    
    // Chamar a função principal quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log("DOM carregado, verificando botões");
            // Verificar se os botões já foram adicionados
            if (!document.getElementById('inlineUndoButton')) {
                addUndoRedoButtons();
            }
        });
    } else {
        // DOM já está pronto
        console.log("DOM já carregado, adicionando botões");
        addUndoRedoButtons();
    }
})(); 