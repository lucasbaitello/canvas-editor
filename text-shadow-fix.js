/**
 * text-shadow-fix.js - Implementação de sombra e alinhamento para texto
 * Este script adiciona funcionalidades para controlar a sombra e o alinhamento de objetos de texto no Fabric.js
 * Autor: Claude 3.7 Sonnet
 * Data: Criado em resposta às necessidades do usuário
 */

// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que o canvas e outros elementos sejam carregados
    setTimeout(function() {
        // Inicializar a funcionalidade de sombra e alinhamento para texto
        initTextShadowAndAlignment();
        console.log("✅ Opções de sombra e alinhamento para texto inicializadas!");
    }, 1000); // Aguardar 1 segundo após o DOM ser carregado
});

/**
 * Inicializa as opções de sombra e alinhamento para texto
 * Adiciona elementos HTML necessários e configura eventos
 */
function initTextShadowAndAlignment() {
    try {
        // Selecionar o menu de edição de texto
        const textEditMenu = document.getElementById('textEditMenu');
        
        if (!textEditMenu) {
            console.error("Menu de edição de texto não encontrado!");
            return;
        }
        
        // Verificar se os elementos já existem (para evitar duplicação)
        if (document.getElementById('textShadowToggle')) {
            console.log("Elementos de sombra e alinhamento já existem, atualizando event listeners.");
            updateTextShadowEventListeners();
            return;
        }
        
        // Criar elementos para sombra
        const shadowHTML = `
            <div class="form-group">
                <label for="textShadowToggle">
                    <input type="checkbox" id="textShadowToggle"> Adicionar sombra
                </label>
            </div>
            <div class="form-group textShadowOptions" style="display: none;">
                <label for="textShadowColor">Cor da sombra:</label>
                <input type="color" id="textShadowColor" value="#000000">
            </div>
            <div class="form-group textShadowOptions" style="display: none;">
                <label for="textShadowOffsetX">Deslocamento X: <span id="textShadowOffsetXValue">3</span>px</label>
                <input type="range" id="textShadowOffsetX" min="-20" max="20" value="3" step="1">
            </div>
            <div class="form-group textShadowOptions" style="display: none;">
                <label for="textShadowOffsetY">Deslocamento Y: <span id="textShadowOffsetYValue">3</span>px</label>
                <input type="range" id="textShadowOffsetY" min="-20" max="20" value="3" step="1">
            </div>
            <div class="form-group textShadowOptions" style="display: none;">
                <label for="textShadowBlur">Desfoque: <span id="textShadowBlurValue">5</span>px</label>
                <input type="range" id="textShadowBlur" min="0" max="20" value="5" step="1">
            </div>
        `;
        
        // Criar elementos para alinhamento de texto
        const alignmentHTML = `
            <div class="form-group">
                <label for="textAlignment">Alinhamento do texto:</label>
                <div class="text-align-buttons">
                    <button id="textAlignLeft" class="text-align-btn active" title="Alinhar à esquerda">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="15" y2="12"></line>
                            <line x1="3" y1="18" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <button id="textAlignCenter" class="text-align-btn" title="Centralizar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="6" y1="12" x2="18" y2="12"></line>
                            <line x1="4" y1="18" x2="20" y2="18"></line>
                        </svg>
                    </button>
                    <button id="textAlignRight" class="text-align-btn" title="Alinhar à direita">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="9" y1="12" x2="21" y2="12"></line>
                            <line x1="6" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // CSS para os botões de alinhamento
        const css = `
            <style>
                .text-align-buttons {
                    display: flex;
                    gap: 5px;
                    margin-top: 5px;
                }
                .text-align-btn {
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    padding: 5px 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                }
                .text-align-btn:hover {
                    background: #f0f0f0;
                }
                .text-align-btn.active {
                    background: #e0e0ff;
                    border-color: #6060ff;
                }
            </style>
        `;
        
        // Adicionar CSS ao head do documento
        document.head.insertAdjacentHTML('beforeend', css);
        
        // Adicionar elementos ao menu de edição de texto
        // Procurar pelo lugar adequado para inserir as opções
        const lastFormGroup = textEditMenu.querySelector('.form-group:last-child');
        
        if (lastFormGroup) {
            // Adicionar opções de alinhamento logo após o último form-group
            lastFormGroup.insertAdjacentHTML('afterend', alignmentHTML);
            
            // Adicionar opções de sombra após o alinhamento
            const alignmentFormGroup = textEditMenu.querySelector('.form-group:last-child');
            alignmentFormGroup.insertAdjacentHTML('afterend', shadowHTML);
        } else {
            // Se não encontrar um .form-group, adicione ao final do menu
            textEditMenu.insertAdjacentHTML('beforeend', alignmentHTML + shadowHTML);
        }
        
        // Configurar os event listeners
        updateTextShadowEventListeners();
        
        console.log("Elementos de sombra e alinhamento adicionados com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar opções de sombra e alinhamento:", error);
    }
}

/**
 * Configura ou atualiza os event listeners para os elementos de sombra e alinhamento
 */
function updateTextShadowEventListeners() {
    try {
        // Toggle de sombra
        const shadowToggle = document.getElementById('textShadowToggle');
        const shadowOptions = document.querySelectorAll('.textShadowOptions');
        
        if (!shadowToggle) {
            console.error("Elemento de toggle de sombra não encontrado!");
            return;
        }
        
        // Manipulador para o toggle de sombra
        shadowToggle.addEventListener('change', function() {
            // Obter o objeto selecionado
            const activeObject = canvas.getActiveObject();
            if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text' && activeObject.type !== 'textbox')) return;
            
            // Mostrar/esconder opções de sombra
            shadowOptions.forEach(option => {
                option.style.display = this.checked ? 'block' : 'none';
            });
            
            // Aplicar/remover sombra
            if (this.checked) {
                // Obter valores dos inputs
                const shadowColor = document.getElementById('textShadowColor').value;
                const offsetX = parseInt(document.getElementById('textShadowOffsetX').value);
                const offsetY = parseInt(document.getElementById('textShadowOffsetY').value);
                const blur = parseInt(document.getElementById('textShadowBlur').value);
                
                // Aplicar sombra
                activeObject.set('shadow', new fabric.Shadow({
                    color: shadowColor,
                    offsetX: offsetX,
                    offsetY: offsetY,
                    blur: blur
                }));
            } else {
                // Remover sombra
                activeObject.set('shadow', null);
            }
            
            canvas.renderAll();
        });
        
        // Manipulador para a cor da sombra
        const shadowColor = document.getElementById('textShadowColor');
        shadowColor.addEventListener('input', updateTextShadow);
        
        // Manipuladores para os sliders de sombra
        document.getElementById('textShadowOffsetX').addEventListener('input', function() {
            document.getElementById('textShadowOffsetXValue').textContent = this.value;
            updateTextShadow();
        });
        
        document.getElementById('textShadowOffsetY').addEventListener('input', function() {
            document.getElementById('textShadowOffsetYValue').textContent = this.value;
            updateTextShadow();
        });
        
        document.getElementById('textShadowBlur').addEventListener('input', function() {
            document.getElementById('textShadowBlurValue').textContent = this.value;
            updateTextShadow();
        });
        
        // Manipuladores para os botões de alinhamento
        document.getElementById('textAlignLeft').addEventListener('click', function() {
            setTextAlignment('left', this);
        });
        
        document.getElementById('textAlignCenter').addEventListener('click', function() {
            setTextAlignment('center', this);
        });
        
        document.getElementById('textAlignRight').addEventListener('click', function() {
            setTextAlignment('right', this);
        });
        
        // Evento para quando um objeto de texto é selecionado
        canvas.on('selection:created', updateTextShadowUI);
        canvas.on('selection:updated', updateTextShadowUI);
        
        console.log("Event listeners para sombra e alinhamento configurados!");
    } catch (error) {
        console.error("Erro ao configurar event listeners para sombra e alinhamento:", error);
    }
}

/**
 * Atualiza a sombra do texto com base nos valores dos controles
 */
function updateTextShadow() {
    try {
        const activeObject = canvas.getActiveObject();
        if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text' && activeObject.type !== 'textbox')) return;
        
        // Obter valores dos inputs
        const shadowColor = document.getElementById('textShadowColor').value;
        const offsetX = parseInt(document.getElementById('textShadowOffsetX').value);
        const offsetY = parseInt(document.getElementById('textShadowOffsetY').value);
        const blur = parseInt(document.getElementById('textShadowBlur').value);
        
        // Aplicar sombra
        activeObject.set('shadow', new fabric.Shadow({
            color: shadowColor,
            offsetX: offsetX,
            offsetY: offsetY,
            blur: blur
        }));
        
        canvas.renderAll();
    } catch (error) {
        console.error("Erro ao atualizar sombra:", error);
    }
}

/**
 * Define o alinhamento do texto
 * @param {string} alignment - Valor do alinhamento ('left', 'center', 'right')
 * @param {HTMLElement} button - Botão de alinhamento clicado
 */
function setTextAlignment(alignment, button) {
    try {
        const activeObject = canvas.getActiveObject();
        if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text' && activeObject.type !== 'textbox')) return;
        
        // Atualizar o alinhamento do texto
        activeObject.set('textAlign', alignment);
        canvas.renderAll();
        
        // Atualizar a interface (destacar o botão clicado)
        document.querySelectorAll('.text-align-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        console.log(`Alinhamento de texto definido como '${alignment}'`);
    } catch (error) {
        console.error("Erro ao definir alinhamento:", error);
    }
}

/**
 * Atualiza a interface do usuário de sombra e alinhamento quando um texto é selecionado
 */
function updateTextShadowUI(e) {
    try {
        const activeObject = e.selected[0];
        if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text' && activeObject.type !== 'textbox')) return;
        
        // Atualizar controles de sombra
        const shadowToggle = document.getElementById('textShadowToggle');
        const shadowOptions = document.querySelectorAll('.textShadowOptions');
        
        // Verificar se o texto tem sombra
        const hasShadow = activeObject.shadow !== null && activeObject.shadow !== undefined;
        
        // Atualizar o estado do toggle
        shadowToggle.checked = hasShadow;
        
        // Mostrar/esconder opções de sombra
        shadowOptions.forEach(option => {
            option.style.display = hasShadow ? 'block' : 'none';
        });
        
        // Se tem sombra, atualizar os controles com os valores atuais
        if (hasShadow) {
            const shadow = activeObject.shadow;
            
            // Atualizar cor da sombra
            document.getElementById('textShadowColor').value = shadow.color;
            
            // Atualizar valores de offset e blur
            const offsetXControl = document.getElementById('textShadowOffsetX');
            const offsetYControl = document.getElementById('textShadowOffsetY');
            const blurControl = document.getElementById('textShadowBlur');
            
            offsetXControl.value = shadow.offsetX || 3;
            document.getElementById('textShadowOffsetXValue').textContent = shadow.offsetX || 3;
            
            offsetYControl.value = shadow.offsetY || 3;
            document.getElementById('textShadowOffsetYValue').textContent = shadow.offsetY || 3;
            
            blurControl.value = shadow.blur || 5;
            document.getElementById('textShadowBlurValue').textContent = shadow.blur || 5;
        }
        
        // Atualizar controles de alinhamento
        const textAlign = activeObject.textAlign || 'left';
        document.querySelectorAll('.text-align-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Ativar o botão correspondente ao alinhamento atual
        if (textAlign === 'left') {
            document.getElementById('textAlignLeft').classList.add('active');
        } else if (textAlign === 'center') {
            document.getElementById('textAlignCenter').classList.add('active');
        } else if (textAlign === 'right') {
            document.getElementById('textAlignRight').classList.add('active');
        }
        
        console.log("Interface de sombra e alinhamento atualizada!");
    } catch (error) {
        console.error("Erro ao atualizar UI de sombra e alinhamento:", error);
    }
} 