/**
 * keyboard-controls-fix.js - Implementação de controles de teclado para o canvas Fabric.js
 * Este script adiciona funcionalidades para copiar/colar (Ctrl+C/Ctrl+V) e movimento com setas
 * Autor: Claude 3.7 Sonnet
 * Data: Atualizado com base na documentação mais recente do Fabric.js
 */

// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o canvas já existe
    if (typeof canvas !== 'undefined') {
        initKeyboardControls();
    } else {
        // Se o canvas ainda não foi inicializado, verificar a cada 100ms até que esteja disponível
        const checkInterval = setInterval(function() {
            if (typeof canvas !== 'undefined') {
                clearInterval(checkInterval);
                initKeyboardControls();
            }
        }, 100);
        
        // Timeout de segurança após 10 segundos
        setTimeout(function() {
            clearInterval(checkInterval);
            console.error("Timeout ao esperar pelo canvas. Verifique se o objeto 'canvas' está definido.");
        }, 10000);
    }
});

/**
 * Objeto global para armazenar os objetos copiados
 */
window._clipboard = null;

/**
 * Inicializa os controles de teclado (copiar/colar e movimento com setas)
 */
function initKeyboardControls() {
    try {
        console.log("Iniciando configuração de controles de teclado...");
        
        // Verificar se o objeto canvas está disponível e é uma instância de fabric.Canvas
        if (typeof canvas === 'undefined' || !(canvas instanceof fabric.Canvas)) {
            console.error("Objeto canvas não encontrado ou não é uma instância válida de fabric.Canvas!");
            return;
        }
        
        // Remover listeners existentes para evitar duplicação
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('paste', handleSystemPaste);
        
        // Adicionar event listener para teclas
        document.addEventListener('keydown', handleKeyDown);
        
        // Adicionar event listener para colar do clipboard do sistema
        document.addEventListener('paste', handleSystemPaste);
        
        // Adicionar CSS para o cursor personalizado durante o movimento com teclas
        addCursorStyles();
        
        console.log("✅ Controles de teclado configurados com sucesso!");
        showNotification("Atalhos de teclado ativados!");
    } catch (error) {
        console.error("Erro ao inicializar controles de teclado:", error);
    }
}

/**
 * Adiciona estilos CSS para cursores personalizados
 */
function addCursorStyles() {
    // Verificar se os estilos já foram adicionados
    if (document.getElementById('keyboard-controls-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'keyboard-controls-styles';
    styleElement.textContent = `
        .key-moving {
            cursor: move !important;
        }
        
        .canvas-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .canvas-notification.show {
            opacity: 1;
        }
    `;
    document.head.appendChild(styleElement);
}

/**
 * Manipula eventos de tecla pressionada
 * @param {KeyboardEvent} e - Evento de tecla
 */
function handleKeyDown(e) {
    try {
        // Verificar se o canvas existe
        if (typeof canvas === 'undefined' || !(canvas instanceof fabric.Canvas)) return;
        
        // Verificar se o canvas está ativo (não estamos digitando em um input)
        if (document.activeElement && 
            (document.activeElement.tagName === 'INPUT' || 
             document.activeElement.tagName === 'TEXTAREA' || 
             document.activeElement.isContentEditable)) {
            return;
        }
        
        // Ctrl+C (Copiar)
        if (e.ctrlKey && (e.key === 'c' || e.keyCode === 67)) {
            copySelectedObjects();
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Ctrl+V (Colar)
        if (e.ctrlKey && (e.key === 'v' || e.keyCode === 86)) {
            pasteObjects();
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Ctrl+X (Recortar)
        if (e.ctrlKey && (e.key === 'x' || e.keyCode === 88)) {
            cutSelectedObjects();
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Teclas de seta (mover objeto selecionado)
        const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        const arrowKeyCodes = [38, 40, 37, 39]; // up, down, left, right
        
        if (arrowKeys.includes(e.key) || arrowKeyCodes.includes(e.keyCode)) {
            moveObjectWithArrowKeys(e);
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Delete ou Backspace (remover objeto selecionado)
        if (e.key === 'Delete' || e.keyCode === 46 || e.key === 'Backspace' || e.keyCode === 8) {
            deleteSelectedObjects();
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    } catch (error) {
        console.error("Erro ao processar evento de teclado:", error);
    }
}

/**
 * Copia os objetos selecionados no canvas para a área de transferência interna
 */
async function copySelectedObjects() {
    try {
        console.log("Iniciando operação de cópia...");
        
        // Verificar se há objetos selecionados
        const activeObject = canvas.getActiveObject();
        if (!activeObject) {
            console.log("Nenhum objeto selecionado para copiar.");
            showNotification("Selecione um objeto para copiar", "error");
            return;
        }
        
        // Limpar a área de transferência interna
        window._clipboard = null;
        
        // Se for uma seleção múltipla (ActiveSelection)
        if (activeObject.type === 'activeSelection') {
            // Criar um novo array para armazenar as cópias dos objetos
            const clonedObjects = [];
            
            // Iterar sobre cada objeto na seleção e cloná-lo
            const objects = activeObject.getObjects();
            console.log(`Tentando copiar ${objects.length} objetos...`);
            
            let successCount = 0;
            
            // Usar Promise.all para clonar todos os objetos de forma assíncrona
            try {
                const clonePromises = objects.map(obj => {
                    return new Promise((resolve, reject) => {
                        if (!obj || typeof obj.clone !== 'function') {
                            console.warn(`Objeto inválido, pulando...`);
                            resolve(null);
                            return;
                        }
                        
                        // Usar o callback de clone para garantir compatibilidade
                        obj.clone(function(cloned) {
                            if (!cloned) {
                                console.warn(`Falha ao clonar objeto, pulando...`);
                                resolve(null);
                                return;
                            }
                            resolve(cloned);
                        }, ['id']);
                    });
                });
                
                const results = await Promise.all(clonePromises);
                
                // Filtrar resultados nulos
                results.forEach(cloned => {
                    if (cloned) {
                        clonedObjects.push(cloned);
                        successCount++;
                    }
                });
            } catch (cloneError) {
                console.error("Erro ao clonar objetos:", cloneError);
                throw cloneError;
            }
            
            // Verificar se algum objeto foi copiado com sucesso
            if (clonedObjects.length === 0) {
                console.error("Nenhum objeto foi copiado com sucesso.");
                showNotification("Erro ao copiar objetos", "error");
                return;
            }
            
            // Armazenar os objetos clonados e metadados na área de transferência
            window._clipboard = {
                objects: clonedObjects,
                isMultiple: true,
                selectionLeft: activeObject.left,
                selectionTop: activeObject.top
            };
            
            console.log(`${successCount} de ${objects.length} objetos copiados para a área de transferência.`);
        } else {
            // Se for um objeto único, cloná-lo
            console.log("Tentando copiar um único objeto...");
            
            try {
                if (typeof activeObject.clone !== 'function') {
                    console.error("Objeto selecionado não suporta clonagem!");
                    showNotification("Erro ao copiar: objeto não suporta clonagem", "error");
                    return;
                }
                
                // Usar o callback de clone para garantir compatibilidade
                activeObject.clone(function(cloned) {
                    if (!cloned) {
                        console.error("Falha ao clonar objeto!");
                        showNotification("Erro ao copiar objeto", "error");
                        return;
                    }
                    
                    // Armazenar o objeto clonado na área de transferência
                    window._clipboard = {
                        objects: [cloned],
                        isMultiple: false
                    };
                    
                    console.log("Objeto copiado para a área de transferência.");
                    showNotification("Objeto copiado!");
                }, ['id']);
            } catch (cloneError) {
                console.error("Erro ao clonar objeto:", cloneError);
                showNotification("Erro ao copiar objeto!", "error");
                return;
            }
        }
    } catch (error) {
        console.error("Erro ao copiar objetos:", error);
        showNotification("Erro ao copiar objeto(s)!", "error");
        // Garantir que a área de transferência seja limpa em caso de erro
        window._clipboard = null;
    }
}

/**
 * Recorta os objetos selecionados (copia e remove)
 */
async function cutSelectedObjects() {
    try {
        // Primeiro, copiar os objetos selecionados
        await copySelectedObjects();
        
        // Em seguida, remover os objetos
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        // Remover os objetos
        if (activeObject.type === 'activeSelection') {
            const objects = activeObject.getObjects();
            activeObject._objects = []; // Esvaziar sem destruir o ActiveSelection
            
            for (let i = 0; i < objects.length; i++) {
                canvas.remove(objects[i]);
            }
            
            canvas.discardActiveObject();
            console.log(`${objects.length} objetos recortados.`);
        } else {
            canvas.remove(activeObject);
            console.log("Objeto recortado.");
        }
        
        canvas.requestRenderAll();
        
        // Notificar o usuário
        showNotification("Objeto(s) recortado(s)!");
    } catch (error) {
        console.error("Erro ao recortar objetos:", error);
        showNotification("Erro ao recortar objeto(s)!", "error");
    }
}

/**
 * Cola os objetos da área de transferência interna no canvas
 */
async function pasteObjects() {
    try {
        console.log("Iniciando operação de colar...");
        
        // Verificar se há objetos na área de transferência
        if (!window._clipboard) {
            console.log("Área de transferência vazia (clipboard é null). Nada para colar.");
            showNotification("Nada para colar!", "error");
            return;
        }
        
        if (!window._clipboard.objects || window._clipboard.objects.length === 0) {
            console.log("Área de transferência vazia (sem objetos). Nada para colar.");
            showNotification("Nada para colar!", "error");
            return;
        }
        
        // Verificar se o canvas está disponível
        if (!canvas || typeof canvas.add !== 'function') {
            console.error("Canvas não está disponível ou não é válido!");
            showNotification("Erro ao colar: canvas não disponível", "error");
            return;
        }
        
        // Descartar objeto ativo (para evitar problemas)
        canvas.discardActiveObject();
        
        // Calcular o deslocamento para a nova posição
        const PASTE_OFFSET = 10;
        
        // Colar objetos
        if (window._clipboard.isMultiple) {
            // Para múltiplos objetos
            const objects = window._clipboard.objects;
            console.log(`Tentando colar ${objects.length} objetos...`);
            
            const clonedObjects = [];
            
            // Calcular o centro do canvas
            const canvasCenter = canvas.getCenter();
            
            // Usar Promise.all para processar todos os objetos
            const pastePromises = objects.map(obj => {
                return new Promise((resolve) => {
                    // Verificar se o objeto é válido
                    if (!obj || typeof obj.clone !== 'function') {
                        console.warn(`Objeto inválido, pulando...`);
                        resolve(null);
                        return;
                    }
                    
                    // Usar o callback de clone para garantir compatibilidade
                    obj.clone(function(cloned) {
                        if (!cloned) {
                            console.warn(`Falha ao clonar objeto, pulando...`);
                            resolve(null);
                            return;
                        }
                        
                        // Posicionar o objeto com um pequeno deslocamento
                        cloned.set({
                            left: (cloned.left || canvasCenter.left) + PASTE_OFFSET,
                            top: (cloned.top || canvasCenter.top) + PASTE_OFFSET,
                            evented: true
                        });
                        
                        // Adicionar ao canvas
                        canvas.add(cloned);
                        resolve(cloned);
                    }, ['id']);
                });
            });
            
            // Aguardar todas as operações de clonagem
            Promise.all(pastePromises).then(results => {
                // Filtrar resultados nulos
                const successfulClones = results.filter(obj => obj !== null);
                
                // Criar uma nova seleção com todos os objetos colados
                if (successfulClones.length > 0) {
                    try {
                        const selection = new fabric.ActiveSelection(successfulClones, {
                            canvas: canvas
                        });
                        canvas.setActiveObject(selection);
                        console.log(`Seleção criada com ${successfulClones.length} objetos.`);
                    } catch (selectionError) {
                        console.error("Erro ao criar seleção:", selectionError);
                    }
                }
                
                console.log(`${successfulClones.length} objetos colados com sucesso.`);
                showNotification(`${successfulClones.length} objeto(s) colado(s)!`);
                
                // Atualizar o canvas
                canvas.requestRenderAll();
            }).catch(error => {
                console.error("Erro ao processar objetos para colar:", error);
                showNotification("Erro ao colar objetos!", "error");
            });
        } else {
            // Para um único objeto
            console.log("Tentando colar um único objeto...");
            
            // Verificar se o objeto é válido
            const originalObject = window._clipboard.objects[0];
            if (!originalObject || typeof originalObject.clone !== 'function') {
                console.error("Objeto na área de transferência é inválido!");
                showNotification("Erro ao colar: objeto inválido", "error");
                return;
            }
            
            // Calcular o centro do canvas como fallback
            const canvasCenter = canvas.getCenter();
            
            // Usar o callback de clone para garantir compatibilidade
            originalObject.clone(function(cloned) {
                if (!cloned) {
                    console.error("Falha ao clonar objeto!");
                    showNotification("Erro ao colar: falha na clonagem", "error");
                    return;
                }
                
                // Posicionar o objeto com um pequeno deslocamento
                cloned.set({
                    left: (cloned.left || canvasCenter.left) + PASTE_OFFSET,
                    top: (cloned.top || canvasCenter.top) + PASTE_OFFSET,
                    evented: true
                });
                
                // Adicionar ao canvas e selecionar
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                
                console.log("Objeto colado com sucesso.");
                showNotification("Objeto colado!");
                
                // Atualizar o canvas
                canvas.requestRenderAll();
            }, ['id']);
        }
    } catch (error) {
        console.error("Erro ao colar objetos:", error);
        showNotification("Erro ao colar objeto(s)!", "error");
    }
}

/**
 * Manipula eventos de colar do sistema (Ctrl+V do Windows)
 * @param {ClipboardEvent} e - Evento de colar
 */
function handleSystemPaste(e) {
    try {
        // Verificar se o canvas existe
        if (typeof canvas === 'undefined' || !(canvas instanceof fabric.Canvas)) {
            console.log("Canvas não disponível para operação de colar.");
            return;
        }
        
        // Verificar se o canvas está ativo (não estamos digitando em um input)
        if (document.activeElement && 
            (document.activeElement.tagName === 'INPUT' || 
             document.activeElement.tagName === 'TEXTAREA' || 
             document.activeElement.isContentEditable)) {
            console.log("Foco em elemento de entrada, permitindo comportamento padrão de colar.");
            return;
        }
        
        console.log("Processando evento de colar...", e);
        
        // Verificar se há dados de imagem na área de transferência
        if (e.clipboardData) {
            console.log("Dados de área de transferência disponíveis:", e.clipboardData.types);
            
            // Verificar se há itens na área de transferência
            if (e.clipboardData.items) {
                const items = e.clipboardData.items;
                console.log(`Encontrados ${items.length} itens na área de transferência`);
                
                for (let i = 0; i < items.length; i++) {
                    console.log(`Item ${i}: tipo = ${items[i].type}`);
                    
                    // Verificar se o item é uma imagem
                    if (items[i].type.indexOf('image') !== -1) {
                        console.log("Imagem detectada na área de transferência");
                        
                        try {
                            // Obter o arquivo de imagem
                            const blob = items[i].getAsFile();
                            if (!blob) {
                                console.error("Não foi possível obter o arquivo da imagem.");
                                continue;
                            }
                            
                            // Criar uma URL temporária para o blob
                            const imageUrl = URL.createObjectURL(blob);
                            
                            // Mostrar um indicador de carregamento
                            showNotification("Carregando imagem...");
                            
                            // Carregar a imagem no canvas
                            fabric.Image.fromURL(imageUrl, function(img) {
                                // Ajustar o tamanho da imagem se for muito grande
                                const maxDimension = 500;
                                if (img.width > maxDimension || img.height > maxDimension) {
                                    const scaleFactor = Math.min(
                                        maxDimension / img.width, 
                                        maxDimension / img.height
                                    );
                                    img.scale(scaleFactor);
                                }
                                
                                // Posicionar a imagem no centro do canvas visível
                                const canvasCenter = canvas.getCenter();
                                img.set({
                                    left: canvasCenter.left,
                                    top: canvasCenter.top,
                                    originX: 'center',
                                    originY: 'center'
                                });
                                
                                // Adicionar ao canvas e selecionar
                                canvas.add(img);
                                canvas.setActiveObject(img);
                                canvas.requestRenderAll();
                                
                                // Liberar a URL temporária
                                URL.revokeObjectURL(imageUrl);
                                
                                console.log("Imagem colada no canvas.");
                                showNotification("Imagem colada com sucesso!");
                            }, { crossOrigin: 'anonymous' });
                            
                            e.preventDefault();
                            return;
                        } catch (imgError) {
                            console.error("Erro ao processar imagem da área de transferência:", imgError);
                            showNotification("Erro ao processar imagem!", "error");
                        }
                    }
                }
            } else {
                console.log("Sem itens na área de transferência, verificando dados de texto");
                
                // Verificar se há texto na área de transferência
                const text = e.clipboardData.getData('text/plain');
                if (text) {
                    console.log("Texto encontrado na área de transferência:", text.substring(0, 50) + (text.length > 50 ? '...' : ''));
                }
            }
        } else {
            console.log("Sem dados de área de transferência disponíveis");
        }
        
        // Se não há imagem na área de transferência, tenta colar objetos internos
        if (window._clipboard) {
            console.log("Usando área de transferência interna para colar objetos");
            pasteObjects();
            e.preventDefault();
        } else {
            console.log("Área de transferência interna vazia, nada para colar");
        }
    } catch (error) {
        console.error("Erro ao processar colar do sistema:", error);
        showNotification("Erro ao colar. Tente novamente!", "error");
    }
}

/**
 * Move o objeto selecionado usando as teclas de seta
 * @param {KeyboardEvent} e - Evento de tecla
 */
function moveObjectWithArrowKeys(e) {
    try {
        // Verificar se há objetos selecionados
        const activeObject = canvas.getActiveObject();
        if (!activeObject) {
            console.log("Nenhum objeto selecionado para mover.");
            return;
        }
        
        // Adicionar classe para cursor personalizado
        document.body.classList.add('key-moving');
        
        // Definir o deslocamento (normal ou com Shift para movimento mais rápido)
        const moveStep = e.shiftKey ? 10 : 1;
        
        // Determinar qual tecla foi pressionada
        const key = e.key || '';
        const keyCode = e.keyCode || 0;
        
        // Mover de acordo com a tecla pressionada
        if (key === 'ArrowUp' || keyCode === 38) {
            activeObject.set('top', activeObject.top - moveStep);
        } else if (key === 'ArrowDown' || keyCode === 40) {
            activeObject.set('top', activeObject.top + moveStep);
        } else if (key === 'ArrowLeft' || keyCode === 37) {
            activeObject.set('left', activeObject.left - moveStep);
        } else if (key === 'ArrowRight' || keyCode === 39) {
            activeObject.set('left', activeObject.left + moveStep);
        }
        
        // Atualizar as coordenadas e renderizar
        activeObject.setCoords();
        canvas.requestRenderAll();
        
        // Para movimento contínuo, registrar este evento como modificação a cada 10 movimentos
        window._moveCounter = (window._moveCounter || 0) + 1;
        if (window._moveCounter >= 10) {
            canvas.fire('object:modified', { target: activeObject });
            window._moveCounter = 0;
        }
        
        // Remover a classe de cursor após um curto atraso
        setTimeout(function() {
            document.body.classList.remove('key-moving');
        }, 100);
    } catch (error) {
        console.error("Erro ao mover objeto com teclas de seta:", error);
        // Garantir que a classe seja removida em caso de erro
        document.body.classList.remove('key-moving');
    }
}

/**
 * Remove os objetos selecionados do canvas
 */
function deleteSelectedObjects() {
    try {
        // Verificar se há objetos selecionados
        const activeObject = canvas.getActiveObject();
        if (!activeObject) {
            console.log("Nenhum objeto selecionado para excluir.");
            return;
        }
        
        // Remover objetos
        if (activeObject.type === 'activeSelection') {
            const objects = activeObject.getObjects();
            const count = objects.length;
            
            activeObject._objects = []; // Esvaziar sem destruir o ActiveSelection
            
            for (let i = 0; i < count; i++) {
                canvas.remove(objects[i]);
            }
            
            console.log(`${count} objetos removidos.`);
            showNotification(`${count} objetos removidos!`);
        } else {
            canvas.remove(activeObject);
            console.log("Objeto removido.");
            showNotification("Objeto removido!");
        }
        
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    } catch (error) {
        console.error("Erro ao excluir objetos:", error);
        showNotification("Erro ao remover objeto(s)!", "error");
    }
}

/**
 * Exibe uma notificação temporária para o usuário
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação ('info', 'error', 'success')
 */
function showNotification(message, type = 'info') {
    try {
        // Verificar se já existe uma notificação
        let notification = document.querySelector('.canvas-notification');
        
        // Se não existir, criar uma nova
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'canvas-notification';
            document.body.appendChild(notification);
        }
        
        // Definir cor baseada no tipo
        let backgroundColor = 'rgba(0, 0, 0, 0.8)'; // padrão (info)
        
        if (type === 'error') {
            backgroundColor = 'rgba(220, 53, 69, 0.9)'; // vermelho
        } else if (type === 'success') {
            backgroundColor = 'rgba(40, 167, 69, 0.9)'; // verde
        }
        
        notification.style.backgroundColor = backgroundColor;
        
        // Atualizar a mensagem e mostrar a notificação
        notification.textContent = message;
        notification.classList.add('show');
        
        // Esconder após 2 segundos
        clearTimeout(notification._timeout);
        notification._timeout = setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    } catch (error) {
        console.error("Erro ao exibir notificação:", error);
    }
}