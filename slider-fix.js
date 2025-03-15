/**
 * Script para corrigir problemas com sliders em todos os menus
 * Implementa corretamente a funcionalidade dos sliders de largura e altura
 * Foco especial no menu de imagens que não estava funcionando
 */
console.log("Carregando correções para sliders...");

// Função principal que será executada quando o DOM estiver totalmente carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, configurando sliders...');
    
    // Tentar configurar após um pequeno atraso para garantir que o canvas foi inicializado
    setTimeout(initializeSliders, 500);
    
    // Adicionar listener para o tab do editor, pois a mudança de aba pode resetar algumas configurações
    const editorTab = document.querySelector('.tab[data-tab="editor"]');
    if (editorTab) {
        editorTab.addEventListener('click', function() {
            console.log('Tab do editor clicado, reconfigurando sliders...');
            setTimeout(initializeSliders, 300);
        });
    }
});

// Função principal para inicializar todos os sliders
function initializeSliders() {
    try {
        console.log('Inicializando corretamente todos os sliders...');
        
        // Verificar se o canvas está disponível
        if (typeof canvas === 'undefined' || !canvas) {
            console.log('Canvas ainda não está disponível, tentando novamente em 1 segundo...');
            setTimeout(initializeSliders, 1000);
            return;
        }
        
        // Configurar event listeners para objetos no canvas
        setupCanvasListeners();
        
        // Configurar sliders de largura e altura para formas
        setupShapeSliders();
        
        // Configurar sliders de largura e altura para textos
        setupTextSliders();
        
        // Configurar sliders de largura e altura para caminhos
        setupPathSliders();
        
        // Configurar sliders de largura e altura para imagens
        setupImageSliders();
        
        console.log('Sliders inicializados com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar sliders:', error);
    }
}

// Configurar listeners para o canvas
function setupCanvasListeners() {
    // Adicionar listener para quando um objeto é selecionado
    canvas.on('selection:created', updateSliders);
    canvas.on('selection:updated', updateSliders);
    
    // Função para atualizar os sliders quando um objeto é selecionado
    function updateSliders(e) {
        try {
            if (!e.selected || e.selected.length === 0) return;
            
            const obj = e.selected[0];
            console.log('Objeto selecionado:', obj.type);
            
            // Atualizar os sliders específicos com base no tipo de objeto
            if (obj.type === 'image') {
                updateImageSliders(obj);
            } else if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
                updateTextSliders(obj);
            } else if (obj.type === 'path') {
                updatePathSliders(obj);
            } else if (isShape(obj)) {
                updateShapeSliders(obj);
            }
        } catch (error) {
            console.error('Erro ao atualizar sliders para o objeto selecionado:', error);
        }
    }
}

// Função para verificar se um objeto é uma forma
function isShape(obj) {
    return obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || 
           obj.type === 'polygon' || obj.type === 'ellipse' || obj.type === 'line' || 
           obj.type === 'polyline';
}

// =====================================================
// CONFIGURAÇÃO DOS SLIDERS DE FORMAS
// =====================================================
function setupShapeSliders() {
    try {
        console.log('Configurando sliders para formas...');
        
        // Slider de largura para formas
        setupSlider('shapeWidth', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && isShape(activeObject)) {
                activeObject.set('width', parseInt(value));
                
                // Se o objeto tiver proporção fixa, ajustar a altura também
                if (activeObject.lockUniScaling) {
                    const ratio = activeObject.height / activeObject.width;
                    activeObject.set('height', parseInt(value) * ratio);
                    
                    // Atualizar o slider de altura
                    const heightSlider = document.getElementById('shapeHeight');
                    if (heightSlider) {
                        heightSlider.value = activeObject.height;
                        const heightValueEl = document.getElementById('shapeHeightValue');
                        if (heightValueEl) heightValueEl.textContent = Math.round(activeObject.height);
                    }
                }
                
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('shapeWidthValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        // Slider de altura para formas
        setupSlider('shapeHeight', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && isShape(activeObject)) {
                activeObject.set('height', parseInt(value));
                
                // Se o objeto tiver proporção fixa, ajustar a largura também
                if (activeObject.lockUniScaling) {
                    const ratio = activeObject.width / activeObject.height;
                    activeObject.set('width', parseInt(value) * ratio);
                    
                    // Atualizar o slider de largura
                    const widthSlider = document.getElementById('shapeWidth');
                    if (widthSlider) {
                        widthSlider.value = activeObject.width;
                        const widthValueEl = document.getElementById('shapeWidthValue');
                        if (widthValueEl) widthValueEl.textContent = Math.round(activeObject.width);
                    }
                }
                
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('shapeHeightValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        console.log('Sliders para formas configurados com sucesso');
    } catch (error) {
        console.error('Erro ao configurar sliders para formas:', error);
    }
}

// Atualizar os sliders de forma quando um objeto é selecionado
function updateShapeSliders(obj) {
    try {
        // Atualizar slider de largura
        const widthSlider = document.getElementById('shapeWidth');
        if (widthSlider) {
            widthSlider.value = Math.round(obj.width * obj.scaleX);
            const widthValueEl = document.getElementById('shapeWidthValue');
            if (widthValueEl) widthValueEl.textContent = Math.round(obj.width * obj.scaleX);
        }
        
        // Atualizar slider de altura
        const heightSlider = document.getElementById('shapeHeight');
        if (heightSlider) {
            heightSlider.value = Math.round(obj.height * obj.scaleY);
            const heightValueEl = document.getElementById('shapeHeightValue');
            if (heightValueEl) heightValueEl.textContent = Math.round(obj.height * obj.scaleY);
        }
    } catch (error) {
        console.error('Erro ao atualizar sliders de forma:', error);
    }
}

// =====================================================
// CONFIGURAÇÃO DOS SLIDERS DE TEXTO
// =====================================================
function setupTextSliders() {
    try {
        console.log('Configurando sliders para textos...');
        
        // Slider de largura para textos
        setupSlider('textWidth', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox')) {
                activeObject.set('width', parseInt(value));
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('textWidthValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        // Slider de altura para textos
        setupSlider('textHeight', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox')) {
                activeObject.set('height', parseInt(value));
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('textHeightValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        console.log('Sliders para textos configurados com sucesso');
    } catch (error) {
        console.error('Erro ao configurar sliders para textos:', error);
    }
}

// Atualizar os sliders de texto quando um objeto é selecionado
function updateTextSliders(obj) {
    try {
        // Atualizar slider de largura
        const widthSlider = document.getElementById('textWidth');
        if (widthSlider) {
            widthSlider.value = Math.round(obj.width * obj.scaleX);
            const widthValueEl = document.getElementById('textWidthValue');
            if (widthValueEl) widthValueEl.textContent = Math.round(obj.width * obj.scaleX);
        }
        
        // Atualizar slider de altura
        const heightSlider = document.getElementById('textHeight');
        if (heightSlider) {
            heightSlider.value = Math.round(obj.height * obj.scaleY);
            const heightValueEl = document.getElementById('textHeightValue');
            if (heightValueEl) heightValueEl.textContent = Math.round(obj.height * obj.scaleY);
        }
    } catch (error) {
        console.error('Erro ao atualizar sliders de texto:', error);
    }
}

// =====================================================
// CONFIGURAÇÃO DOS SLIDERS DE CAMINHO (PATH)
// =====================================================
function setupPathSliders() {
    try {
        console.log('Configurando sliders para caminhos...');
        
        // Slider de largura para caminhos
        setupSlider('pathWidth', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'path') {
                // Para paths, precisamos usar scaleX em vez de width diretamente
                const originalWidth = activeObject.width || activeObject.getBoundingRect().width / activeObject.scaleX;
                const newScale = parseInt(value) / originalWidth;
                
                activeObject.set('scaleX', newScale);
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('pathWidthValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        // Slider de altura para caminhos
        setupSlider('pathHeight', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'path') {
                // Para paths, precisamos usar scaleY em vez de height diretamente
                const originalHeight = activeObject.height || activeObject.getBoundingRect().height / activeObject.scaleY;
                const newScale = parseInt(value) / originalHeight;
                
                activeObject.set('scaleY', newScale);
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('pathHeightValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        console.log('Sliders para caminhos configurados com sucesso');
    } catch (error) {
        console.error('Erro ao configurar sliders para caminhos:', error);
    }
}

// Atualizar os sliders de caminho quando um objeto é selecionado
function updatePathSliders(obj) {
    try {
        // Para paths, calculamos a largura/altura com base na bbox e escala
        const boundingRect = obj.getBoundingRect();
        
        // Atualizar slider de largura
        const widthSlider = document.getElementById('pathWidth');
        if (widthSlider) {
            const actualWidth = Math.round(boundingRect.width);
            widthSlider.value = actualWidth;
            const widthValueEl = document.getElementById('pathWidthValue');
            if (widthValueEl) widthValueEl.textContent = actualWidth;
        }
        
        // Atualizar slider de altura
        const heightSlider = document.getElementById('pathHeight');
        if (heightSlider) {
            const actualHeight = Math.round(boundingRect.height);
            heightSlider.value = actualHeight;
            const heightValueEl = document.getElementById('pathHeightValue');
            if (heightValueEl) heightValueEl.textContent = actualHeight;
        }
    } catch (error) {
        console.error('Erro ao atualizar sliders de caminho:', error);
    }
}

// =====================================================
// CONFIGURAÇÃO DOS SLIDERS DE IMAGEM
// =====================================================
function setupImageSliders() {
    try {
        console.log('Configurando sliders para imagens...');
        
        // Slider de largura para imagens
        setupSlider('imageWidth', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'image') {
                // Para imagens, usar scaleToWidth para manter proporção correta se necessário
                if (document.getElementById('imageKeepAspect') && 
                    document.getElementById('imageKeepAspect').checked) {
                    activeObject.scaleToWidth(parseInt(value));
                    
                    // Atualizar o slider de altura após o redimensionamento
                    setTimeout(function() {
                        const heightSlider = document.getElementById('imageHeight');
                        if (heightSlider) {
                            const newHeight = Math.round(activeObject.getBoundingRect().height);
                            heightSlider.value = newHeight;
                            const heightValueEl = document.getElementById('imageHeightValue');
                            if (heightValueEl) heightValueEl.textContent = newHeight;
                        }
                    }, 50);
                } else {
                    // Se não precisar manter proporção, apenas ajustar scaleX
                    const originalWidth = activeObject.width;
                    activeObject.set('scaleX', parseInt(value) / originalWidth);
                }
                
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('imageWidthValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        // Slider de altura para imagens
        setupSlider('imageHeight', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'image') {
                // Para imagens, usar scaleToHeight para manter proporção correta se necessário
                if (document.getElementById('imageKeepAspect') && 
                    document.getElementById('imageKeepAspect').checked) {
                    activeObject.scaleToHeight(parseInt(value));
                    
                    // Atualizar o slider de largura após o redimensionamento
                    setTimeout(function() {
                        const widthSlider = document.getElementById('imageWidth');
                        if (widthSlider) {
                            const newWidth = Math.round(activeObject.getBoundingRect().width);
                            widthSlider.value = newWidth;
                            const widthValueEl = document.getElementById('imageWidthValue');
                            if (widthValueEl) widthValueEl.textContent = newWidth;
                        }
                    }, 50);
                } else {
                    // Se não precisar manter proporção, apenas ajustar scaleY
                    const originalHeight = activeObject.height;
                    activeObject.set('scaleY', parseInt(value) / originalHeight);
                }
                
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('imageHeightValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        // Configurar outros controles do menu de imagens, se existirem
        
        // Slider de opacidade (já pode existir, mas configurando novamente para garantir)
        setupSlider('imageOpacity', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'image') {
                activeObject.set('opacity', parseInt(value) / 100);
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('imageOpacityValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        // Slider de largura de borda (já pode existir, mas configurando novamente para garantir)
        setupSlider('imageBorderWidth', function(value) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'image') {
                activeObject.set('strokeWidth', parseInt(value));
                canvas.renderAll();
                
                // Atualizar o valor mostrado
                const valueEl = document.getElementById('imageBorderWidthValue');
                if (valueEl) valueEl.textContent = value;
            }
        });
        
        // Seletor de cor de borda (já pode existir, mas configurando novamente para garantir)
        const borderColorPicker = document.getElementById('imageBorderColor');
        if (borderColorPicker) {
            borderColorPicker.addEventListener('input', function(e) {
                const activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.type === 'image') {
                    activeObject.set('stroke', e.target.value);
                    canvas.renderAll();
                }
            });
        }
        
        // Verificar se existe um checkbox para manter proporção, se não, adicionar
        if (!document.getElementById('imageKeepAspect')) {
            const imageMenu = document.getElementById('imageMenu');
            if (imageMenu) {
                const aspectContainer = document.createElement('div');
                aspectContainer.className = 'control-group';
                aspectContainer.innerHTML = `
                    <label>
                        <input type="checkbox" id="imageKeepAspect" checked>
                        Manter proporção
                    </label>
                `;
                
                // Inserir antes dos controles de largura e altura
                const widthLabel = imageMenu.querySelector('label[for="imageWidth"]');
                if (widthLabel && widthLabel.parentNode) {
                    widthLabel.parentNode.insertBefore(aspectContainer, widthLabel);
                } else {
                    // Se não encontrar o controle de largura, adicionar ao final
                    imageMenu.appendChild(aspectContainer);
                }
                
                // Adicionar event listener
                document.getElementById('imageKeepAspect').addEventListener('change', function() {
                    console.log('Manter proporção:', this.checked);
                });
            }
        }
        
        console.log('Sliders para imagens configurados com sucesso');
    } catch (error) {
        console.error('Erro ao configurar sliders para imagens:', error);
    }
}

// Atualizar os sliders de imagem quando uma imagem é selecionada
function updateImageSliders(obj) {
    try {
        // Para imagens, calculamos a largura/altura real com base na bbox
        const boundingRect = obj.getBoundingRect();
        
        // Atualizar slider de largura
        const widthSlider = document.getElementById('imageWidth');
        if (widthSlider) {
            const actualWidth = Math.round(boundingRect.width);
            widthSlider.value = actualWidth;
            const widthValueEl = document.getElementById('imageWidthValue');
            if (widthValueEl) widthValueEl.textContent = actualWidth;
        }
        
        // Atualizar slider de altura
        const heightSlider = document.getElementById('imageHeight');
        if (heightSlider) {
            const actualHeight = Math.round(boundingRect.height);
            heightSlider.value = actualHeight;
            const heightValueEl = document.getElementById('imageHeightValue');
            if (heightValueEl) heightValueEl.textContent = actualHeight;
        }
        
        // Atualizar slider de opacidade
        const opacitySlider = document.getElementById('imageOpacity');
        if (opacitySlider) {
            const opacity = Math.round(obj.opacity * 100);
            opacitySlider.value = opacity;
            const opacityValueEl = document.getElementById('imageOpacityValue');
            if (opacityValueEl) opacityValueEl.textContent = opacity;
        }
        
        // Atualizar slider de largura de borda
        const borderWidthSlider = document.getElementById('imageBorderWidth');
        if (borderWidthSlider) {
            const borderWidth = obj.strokeWidth || 0;
            borderWidthSlider.value = borderWidth;
            const borderWidthValueEl = document.getElementById('imageBorderWidthValue');
            if (borderWidthValueEl) borderWidthValueEl.textContent = borderWidth;
        }
        
        // Atualizar seletor de cor de borda
        const borderColorPicker = document.getElementById('imageBorderColor');
        if (borderColorPicker) {
            borderColorPicker.value = obj.stroke || '#000000';
        }
    } catch (error) {
        console.error('Erro ao atualizar sliders de imagem:', error);
    }
}

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

// Função genérica para configurar um slider
function setupSlider(sliderId, callback) {
    const slider = document.getElementById(sliderId);
    if (!slider) {
        console.log(`Slider ${sliderId} não encontrado no DOM`);
        return;
    }
    
    // Remover event listeners existentes para evitar duplicação
    const newSlider = slider.cloneNode(true);
    slider.parentNode.replaceChild(newSlider, slider);
    
    // Adicionar novos event listeners
    newSlider.addEventListener('input', function(e) {
        callback(e.target.value);
    });
    
    newSlider.addEventListener('change', function(e) {
        callback(e.target.value);
    });
    
    console.log(`Slider ${sliderId} configurado com sucesso`);
}

// Iniciar a configuração após um pequeno atraso para garantir que tudo está carregado
setTimeout(function() {
    console.log('Tentando inicializar sliders...');
    if (document.readyState === 'complete') {
        initializeSliders();
    }
}, 2000); 