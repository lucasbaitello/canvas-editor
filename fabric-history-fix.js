/**
 * Script para implementar funcionalidades de desfazer (undo) e refazer (redo)
 * usando a biblioteca fabric-history
 * 
 * Este script adiciona botões de undo/redo depois do botão de cor e
 * configura atalhos de teclado (Ctrl+Z e Ctrl+Y)
 */
console.log("Script de fabric-history carregado!");

// Função principal que será executada quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, carregando biblioteca fabric-history...");
    
    // Carregar a biblioteca fabric-history via CDN
    loadFabricHistory();
    
    // Tentar configurar após um pequeno atraso para garantir que tudo carregou
    setTimeout(setupUndoRedo, 1000);
    
    // Adicionar evento para quando a aba do editor for clicada, para caso a inicialização seja em outra aba
    const editorTab = document.querySelector('.tab[data-tab="editor"]');
    if (editorTab) {
        console.log("Aba do editor encontrada, adicionando listener...");
        editorTab.addEventListener('click', function() {
            console.log("Aba do editor clicada, reconfigurando undo/redo...");
            setTimeout(setupUndoRedo, 500);
        });
    }
});

// Função para carregar a biblioteca fabric-history via CDN
function loadFabricHistory() {
    // Verificar se já foi carregada
    if (document.querySelector('script[src*="fabric-history"]')) {
        console.log("Biblioteca fabric-history já carregada");
        return;
    }
    
    console.log("Carregando biblioteca fabric-history via CDN...");
    
    // Criar elemento script
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/fabric-history@latest/dist/index.min.js";
    script.onload = function() {
        console.log("Biblioteca fabric-history carregada com sucesso!");
        setupUndoRedo();
    };
    script.onerror = function() {
        console.error("Erro ao carregar biblioteca fabric-history!");
        // Criar implementação própria como fallback
        setupCustomUndoRedo();
    };
    
    // Adicionar ao documento
    document.head.appendChild(script);
}

// Função para configurar undo/redo usando fabric-history
function setupUndoRedo() {
    try {
        console.log("Configurando undo/redo...");
        
        // Verificar se o canvas existe
        if (typeof canvas === 'undefined' || !canvas || !canvas.on) {
            console.log("Canvas ainda não disponível, tentando novamente em 1 segundo...");
            setTimeout(setupUndoRedo, 1000);
            return;
        }
        
        console.log("Canvas encontrado:", canvas);
        
        // Verificar se a biblioteca fabric-history está disponível
        if (typeof FabricHistory === 'undefined') {
            console.log("FabricHistory não está disponível, tentando novamente em 1 segundo...");
            setTimeout(setupUndoRedo, 1000);
            return;
        }
        
        console.log("FabricHistory encontrado, inicializando...");
        
        // Inicializar FabricHistory com o canvas
        // A biblioteca se encarrega de registrar os eventos necessários
        FabricHistory.init(canvas);
        
        // Criar ou atualizar os botões
        createUndoRedoButtons();
        
        console.log("Undo/Redo configurado com sucesso!");
    } catch (error) {
        console.error("Erro ao configurar undo/redo:", error);
        // Tentar implementação própria como fallback
        setupCustomUndoRedo();
    }
}

// Função para criar os botões de undo/redo
function createUndoRedoButtons() {
    try {
        console.log("Criando botões de undo/redo...");
        
        // Verificar se os botões já existem
        if (document.getElementById('fabricHistoryUndoButton') && document.getElementById('fabricHistoryRedoButton')) {
            console.log("Botões já existem, apenas atualizando eventos...");
            updateButtonEvents();
            return;
        }
        
        // Procurar o botão de cor para posicionar depois dele
        const colorButton = document.getElementById('colorButton');
        let targetContainer = null;
        
        if (colorButton) {
            console.log("Botão de cor encontrado:", colorButton);
            targetContainer = colorButton.parentNode;
        } else {
            console.log("Botão de cor não encontrado, buscando alternativas...");
            
            // Tentar encontrar outras referências
            const toolbar = document.querySelector('.editor-toolbar') || 
                           document.querySelector('.toolbar') || 
                           document.querySelector('.editor-controls');
            
            if (toolbar) {
                console.log("Barra de ferramentas encontrada:", toolbar);
                targetContainer = toolbar;
            } else {
                console.log("Nenhuma barra de ferramentas encontrada, usando o canvas como referência...");
                const canvasElement = document.getElementById('c');
                if (canvasElement) {
                    targetContainer = canvasElement.parentNode;
                } else {
                    console.error("Não foi possível encontrar um local para adicionar os botões!");
                    return;
                }
            }
        }
        
        // Criar container para os botões
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'fabricHistoryButtonContainer';
        buttonContainer.style.display = 'inline-block';
        buttonContainer.style.marginLeft = '10px';
        buttonContainer.style.verticalAlign = 'middle';
        
        // Criar botão de undo
        const undoButton = document.createElement('button');
        undoButton.id = 'fabricHistoryUndoButton';
        undoButton.className = 'editor-button';
        undoButton.title = 'Desfazer (Ctrl+Z)';
        undoButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h10c4 0 7 3 7 7v0c0 4-3 7-7 7H9"></path><path d="M3 10l5-5"></path><path d="M3 10l5 5"></path></svg>';
        undoButton.style.backgroundColor = '#f8f9fa';
        undoButton.style.border = '1px solid #ddd';
        undoButton.style.borderRadius = '4px';
        undoButton.style.padding = '6px';
        undoButton.style.margin = '0 5px';
        undoButton.style.cursor = 'pointer';
        
        // Criar botão de redo
        const redoButton = document.createElement('button');
        redoButton.id = 'fabricHistoryRedoButton';
        redoButton.className = 'editor-button';
        redoButton.title = 'Refazer (Ctrl+Y)';
        redoButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10H11c-4 0-7 3-7 7v0c0 4 3 7 7 7h4"></path><path d="M21 10l-5-5"></path><path d="M21 10l-5 5"></path></svg>';
        redoButton.style.backgroundColor = '#f8f9fa';
        redoButton.style.border = '1px solid #ddd';
        redoButton.style.borderRadius = '4px';
        redoButton.style.padding = '6px';
        redoButton.style.margin = '0 5px';
        redoButton.style.cursor = 'pointer';
        
        // Adicionar botões ao container
        buttonContainer.appendChild(undoButton);
        buttonContainer.appendChild(redoButton);
        
        // Inserir no DOM
        if (colorButton) {
            targetContainer.insertBefore(buttonContainer, colorButton.nextSibling);
        } else {
            targetContainer.appendChild(buttonContainer);
        }
        
        console.log("Botões criados e adicionados ao DOM");
        
        // Configurar eventos dos botões
        updateButtonEvents();
        
        // Configurar atalhos de teclado
        setupKeyboardShortcuts();
        
        console.log("Eventos dos botões e atalhos de teclado configurados");
    } catch (error) {
        console.error("Erro ao criar botões:", error);
    }
}

// Função para atualizar os eventos dos botões
function updateButtonEvents() {
    try {
        const undoButton = document.getElementById('fabricHistoryUndoButton');
        const redoButton = document.getElementById('fabricHistoryRedoButton');
        
        if (undoButton) {
            // Remover eventos antigos para evitar duplicação
            undoButton.replaceWith(undoButton.cloneNode(true));
            const newUndoButton = document.getElementById('fabricHistoryUndoButton');
            
            // Adicionar novo evento
            newUndoButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Botão undo clicado");
                
                // Usar a função undo da biblioteca fabric-history
                if (typeof FabricHistory !== 'undefined' && FabricHistory.undo) {
                    FabricHistory.undo();
                } else {
                    console.error("Função undo não disponível!");
                }
            });
        }
        
        if (redoButton) {
            // Remover eventos antigos para evitar duplicação
            redoButton.replaceWith(redoButton.cloneNode(true));
            const newRedoButton = document.getElementById('fabricHistoryRedoButton');
            
            // Adicionar novo evento
            newRedoButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Botão redo clicado");
                
                // Usar a função redo da biblioteca fabric-history
                if (typeof FabricHistory !== 'undefined' && FabricHistory.redo) {
                    FabricHistory.redo();
                } else {
                    console.error("Função redo não disponível!");
                }
            });
        }
        
        console.log("Eventos dos botões atualizados");
    } catch (error) {
        console.error("Erro ao atualizar eventos dos botões:", error);
    }
}

// Função para configurar atalhos de teclado
function setupKeyboardShortcuts() {
    try {
        // Remover evento antigo, se existir
        if (window._undoRedoKeydownListener) {
            document.removeEventListener('keydown', window._undoRedoKeydownListener);
        }
        
        // Criar nova função listener
        window._undoRedoKeydownListener = function(event) {
            // Verificar se o foco não está em um campo de texto
            if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA' && !event.target.isContentEditable) {
                // Ctrl+Z para undo
                if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
                    event.preventDefault();
                    console.log("Atalho Ctrl+Z detectado");
                    
                    // Usar a função undo da biblioteca fabric-history
                    if (typeof FabricHistory !== 'undefined' && FabricHistory.undo) {
                        FabricHistory.undo();
                    } else {
                        console.error("Função undo não disponível!");
                    }
                }
                
                // Ctrl+Y para redo
                if (event.ctrlKey && (event.key === 'y' || event.key === 'Y')) {
                    event.preventDefault();
                    console.log("Atalho Ctrl+Y detectado");
                    
                    // Usar a função redo da biblioteca fabric-history
                    if (typeof FabricHistory !== 'undefined' && FabricHistory.redo) {
                        FabricHistory.redo();
                    } else {
                        console.error("Função redo não disponível!");
                    }
                }
            }
        };
        
        // Registrar a função como listener
        document.addEventListener('keydown', window._undoRedoKeydownListener);
        
        console.log("Atalhos de teclado configurados");
    } catch (error) {
        console.error("Erro ao configurar atalhos de teclado:", error);
    }
}

// Função para configurar uma implementação própria como fallback, caso a biblioteca não carregue
function setupCustomUndoRedo() {
    try {
        console.log("Configurando implementação própria de undo/redo como fallback...");
        
        // Verificar se o canvas existe
        if (typeof canvas === 'undefined' || !canvas || !canvas.on) {
            console.log("Canvas ainda não disponível, tentando novamente em 1 segundo...");
            setTimeout(setupCustomUndoRedo, 1000);
            return;
        }
        
        console.log("Canvas encontrado, configurando implementação própria...");
        
        // Criar namespace global para nossa implementação
        window.FabricHistory = {
            _history: [],
            _currentIndex: -1,
            _maxSteps: 30,
            
            // Inicializar o histórico
            init: function(canvas) {
                this._canvas = canvas;
                this._registerEvents();
                this._saveState();
            },
            
            // Registrar eventos do canvas
            _registerEvents: function() {
                const self = this;
                
                // Eventos que salvam estado imediatamente
                const immediateEvents = [
                    'object:added',
                    'object:removed',
                    'object:modified',
                    'path:created',
                    'selection:cleared'
                ];
                
                immediateEvents.forEach(function(eventName) {
                    self._canvas.on(eventName, function() {
                        self._saveState();
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
                    self._canvas.on(eventName, function() {
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(function() {
                            self._saveState();
                        }, 300);
                    });
                });
            },
            
            // Salvar estado do canvas
            _saveState: function() {
                try {
                    // Converter o canvas para JSON
                    const json = this._canvas.toJSON(['id', 'selectable']);
                    const state = JSON.stringify(json);
                    
                    // Verificar se o estado é igual ao atual
                    if (this._currentIndex >= 0 && this._history[this._currentIndex] === state) {
                        return;
                    }
                    
                    // Se estamos no meio do histórico, descartar estados futuros
                    if (this._currentIndex < this._history.length - 1) {
                        this._history = this._history.slice(0, this._currentIndex + 1);
                    }
                    
                    // Adicionar novo estado
                    this._history.push(state);
                    this._currentIndex = this._history.length - 1;
                    
                    // Limitar tamanho do histórico
                    if (this._history.length > this._maxSteps) {
                        this._history.shift();
                        this._currentIndex--;
                    }
                    
                    console.log(`Estado salvo: ${this._currentIndex}/${this._history.length - 1}`);
                } catch (error) {
                    console.error("Erro ao salvar estado:", error);
                }
            },
            
            // Carregar estado do histórico
            _loadState: function(index) {
                try {
                    if (index < 0 || index >= this._history.length) {
                        return;
                    }
                    
                    const self = this;
                    
                    // Desativar eventos temporariamente
                    const events = this._canvas._events;
                    this._canvas._events = {};
                    
                    // Carregar estado
                    this._canvas.loadFromJSON(JSON.parse(this._history[index]), function() {
                        // Restaurar eventos
                        self._canvas._events = events;
                        
                        // Atualizar índice atual
                        self._currentIndex = index;
                        
                        // Renderizar canvas
                        self._canvas.renderAll();
                        
                        console.log(`Estado ${index} carregado`);
                    });
                } catch (error) {
                    console.error("Erro ao carregar estado:", error);
                }
            },
            
            // Função undo pública
            undo: function() {
                if (this._currentIndex <= 0) {
                    console.log("Não há ações para desfazer");
                    return;
                }
                
                console.log("Desfazendo ação");
                this._loadState(this._currentIndex - 1);
            },
            
            // Função redo pública
            redo: function() {
                if (this._currentIndex >= this._history.length - 1) {
                    console.log("Não há ações para refazer");
                    return;
                }
                
                console.log("Refazendo ação");
                this._loadState(this._currentIndex + 1);
            }
        };
        
        // Inicializar nossa implementação
        FabricHistory.init(canvas);
        
        // Criar ou atualizar os botões
        createUndoRedoButtons();
        
        console.log("Implementação própria de undo/redo configurada com sucesso!");
    } catch (error) {
        console.error("Erro ao configurar implementação própria:", error);
    }
}

// Tentar inicializar após um pequeno atraso para garantir que o DOM esteja pronto
setTimeout(function() {
    console.log("Inicialização secundária do fabric-history-fix...");
    if (document.readyState === 'complete') {
        setupUndoRedo();
    }
}, 2000); 