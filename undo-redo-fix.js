/**
 * undo-redo-fix.js - Correção para os botões de undo/redo
 * Este script corrige problemas com os botões de undo/redo que pararam de funcionar após atualizações
 * Autor: Claude 3.7 Sonnet
 * Data: Criado em resposta às necessidades do usuário
 */

// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que o canvas e outros elementos sejam carregados
    setTimeout(function() {
        // Inicializar a correção para undo/redo
        initUndoRedoFix();
        console.log("✅ Correção de undo/redo inicializada!");
    }, 1000); // Aguardar 1 segundo após o DOM ser carregado
});

/**
 * Inicializa a correção para os botões de undo/redo
 */
function initUndoRedoFix() {
    try {
        console.log("Iniciando correção dos botões de undo/redo...");
        
        // Verificar se o objeto canvas está disponível
        if (typeof canvas === 'undefined') {
            console.error("Objeto canvas não encontrado!");
            return;
        }
        
        // Definir referências para botões de undo/redo
        const undoButton = document.getElementById('undoButton');
        const redoButton = document.getElementById('redoButton');
        
        if (!undoButton || !redoButton) {
            console.error("Botões de undo/redo não encontrados!");
            return;
        }
        
        console.log("Botões de undo/redo encontrados:", undoButton, redoButton);
        
        // Verificar se a biblioteca fabric-history está disponível
        if (typeof fabric.Canvas.prototype.historyInit === 'function') {
            console.log("Usando fabric-history para undo/redo");
            
            // Remover event listeners existentes (se houver)
            undoButton.removeEventListener('click', handleUndo);
            redoButton.removeEventListener('click', handleRedo);
            
            // Definir novas funções para undo/redo
            window.handleUndo = function() {
                if (undoButton.classList.contains('disabled')) return;
                
                // Desabilitar o botão durante o processamento
                undoButton.classList.add('disabled');
                
                console.log("Executando undo...");
                if (canvas.undo) {
                    canvas.undo();
                } else if (canvas.historyUndo) {
                    canvas.historyUndo();
                }
                
                // Reabilitar o botão após um breve atraso
                setTimeout(() => {
                    undoButton.classList.remove('disabled');
                    updateUndoRedoButtons();
                }, 100);
            };
            
            window.handleRedo = function() {
                if (redoButton.classList.contains('disabled')) return;
                
                // Desabilitar o botão durante o processamento
                redoButton.classList.add('disabled');
                
                console.log("Executando redo...");
                if (canvas.redo) {
                    canvas.redo();
                } else if (canvas.historyRedo) {
                    canvas.historyRedo();
                }
                
                // Reabilitar o botão após um breve atraso
                setTimeout(() => {
                    redoButton.classList.remove('disabled');
                    updateUndoRedoButtons();
                }, 100);
            };
            
            // Adicionar event listeners aos botões
            undoButton.addEventListener('click', handleUndo);
            redoButton.addEventListener('click', handleRedo);
            
            // Atualizar estado inicial dos botões
            updateUndoRedoButtons();
            
            // Adicionar listeners para atualizar o estado dos botões
            // após qualquer modificação no canvas
            canvas.on('object:added', updateUndoRedoButtons);
            canvas.on('object:removed', updateUndoRedoButtons);
            canvas.on('object:modified', updateUndoRedoButtons);
            canvas.on('path:created', updateUndoRedoButtons);
            
            console.log("Event listeners para botões de undo/redo configurados!");
        } else {
            console.warn("fabric-history não encontrado, implementando solução alternativa...");
            implementCustomUndoRedo();
        }
    } catch (error) {
        console.error("Erro ao inicializar correção de undo/redo:", error);
    }
}

/**
 * Atualiza o estado dos botões de undo/redo
 * com base no histórico atual
 */
function updateUndoRedoButtons() {
    try {
        const undoButton = document.getElementById('undoButton');
        const redoButton = document.getElementById('redoButton');
        
        if (!undoButton || !redoButton) return;
        
        // Verificar se temos uma função para checar o estado
        let canUndo = false;
        let canRedo = false;
        
        if (typeof canvas._historyNext !== 'undefined') {
            // Se estamos usando a implementação inline-undo-redo.js
            canUndo = canvas._historyNext > 0;
            canRedo = canvas._historyNext < canvas._history.length - 1;
        } else if (typeof canvas.historyCanUndo === 'function' && typeof canvas.historyCanRedo === 'function') {
            // Se estamos usando fabric-history-fix.js
            canUndo = canvas.historyCanUndo();
            canRedo = canvas.historyCanRedo();
        } else if (typeof canvas.undoStatus === 'function' && typeof canvas.redoStatus === 'function') {
            // Outra implementação possível
            canUndo = canvas.undoStatus();
            canRedo = canvas.redoStatus();
        }
        
        // Atualizar classes dos botões
        if (canUndo) {
            undoButton.classList.remove('disabled');
        } else {
            undoButton.classList.add('disabled');
        }
        
        if (canRedo) {
            redoButton.classList.remove('disabled');
        } else {
            redoButton.classList.add('disabled');
        }
        
        console.log(`Estado dos botões atualizado: undo=${canUndo}, redo=${canRedo}`);
    } catch (error) {
        console.error("Erro ao atualizar estado dos botões:", error);
    }
}

/**
 * Implementa uma solução alternativa para undo/redo
 * caso a biblioteca fabric-history não esteja disponível
 */
function implementCustomUndoRedo() {
    try {
        console.log("Implementando solução alternativa para undo/redo...");
        
        // Inicializar variáveis de histórico
        canvas._history = [];
        canvas._historyNext = 0;
        canvas._historyInitial = canvas.toJSON();
        
        // Salvar estado atual como primeiro ponto do histórico
        canvas._history.push(JSON.stringify(canvas));
        
        // Configurar função para salvar estados no histórico
        const saveState = () => {
            try {
                // Se já avançamos no histórico, remover estados futuros
                if (canvas._historyNext < canvas._history.length - 1) {
                    canvas._history = canvas._history.slice(0, canvas._historyNext + 1);
                }
                
                // Salvar estado atual
                canvas._history.push(JSON.stringify(canvas));
                canvas._historyNext = canvas._history.length - 1;
                
                // Limitar o tamanho do histórico para evitar uso excessivo de memória
                if (canvas._history.length > 50) {
                    canvas._history.shift();
                    canvas._historyNext--;
                }
                
                // Atualizar estado dos botões
                updateUndoRedoButtons();
                
                console.log(`Novo estado salvo no histórico. Total: ${canvas._history.length}, Atual: ${canvas._historyNext}`);
            } catch (error) {
                console.error("Erro ao salvar estado:", error);
            }
        };
        
        // Configurar funções undo e redo
        canvas.undo = function() {
            try {
                if (canvas._historyNext <= 0) return;
                
                console.log("Executando undo customizado...");
                canvas._historyNext--;
                
                const json = canvas._history[canvas._historyNext];
                canvas.loadFromJSON(json, function() {
                    canvas.renderAll();
                    console.log("Undo completo");
                    updateUndoRedoButtons();
                });
            } catch (error) {
                console.error("Erro ao executar undo:", error);
            }
        };
        
        canvas.redo = function() {
            try {
                if (canvas._historyNext >= canvas._history.length - 1) return;
                
                console.log("Executando redo customizado...");
                canvas._historyNext++;
                
                const json = canvas._history[canvas._historyNext];
                canvas.loadFromJSON(json, function() {
                    canvas.renderAll();
                    console.log("Redo completo");
                    updateUndoRedoButtons();
                });
            } catch (error) {
                console.error("Erro ao executar redo:", error);
            }
        };
        
        // Configurar event listeners para salvar estados
        canvas.on('object:added', saveState);
        canvas.on('object:removed', saveState);
        canvas.on('object:modified', saveState);
        canvas.on('path:created', saveState);
        
        // Atualizar event listeners dos botões
        const undoButton = document.getElementById('undoButton');
        const redoButton = document.getElementById('redoButton');
        
        // Remover event listeners existentes (se houver)
        undoButton.removeEventListener('click', window.handleUndo);
        redoButton.removeEventListener('click', window.handleRedo);
        
        // Definir novas funções para undo/redo
        window.handleUndo = function() {
            if (undoButton.classList.contains('disabled')) return;
            
            // Desabilitar o botão durante o processamento
            undoButton.classList.add('disabled');
            canvas.undo();
            
            // Reabilitar o botão após um breve atraso
            setTimeout(() => {
                undoButton.classList.remove('disabled');
                updateUndoRedoButtons();
            }, 100);
        };
        
        window.handleRedo = function() {
            if (redoButton.classList.contains('disabled')) return;
            
            // Desabilitar o botão durante o processamento
            redoButton.classList.add('disabled');
            canvas.redo();
            
            // Reabilitar o botão após um breve atraso
            setTimeout(() => {
                redoButton.classList.remove('disabled');
                updateUndoRedoButtons();
            }, 100);
        };
        
        // Adicionar event listeners aos botões
        undoButton.addEventListener('click', window.handleUndo);
        redoButton.addEventListener('click', window.handleRedo);
        
        // Atualizar estado inicial dos botões
        updateUndoRedoButtons();
        
        console.log("Solução alternativa para undo/redo implementada com sucesso!");
    } catch (error) {
        console.error("Erro ao implementar solução alternativa para undo/redo:", error);
    }
} 