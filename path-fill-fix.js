/**
 * path-fill-fix.js - Implementação de toggle de preenchimento e opções de cor/opacidade para caminhos
 * Este script adiciona funcionalidades para controlar o preenchimento de objetos do tipo path no Fabric.js
 * Autor: Claude 3.7 Sonnet
 * Data: Criado em resposta às necessidades do usuário
 */

// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que o canvas e outros elementos sejam carregados
    setTimeout(function() {
        // Inicializar a funcionalidade de configuração de preenchimento para paths
        initPathFillOptions();
        console.log("✅ Opções de preenchimento para caminhos inicializadas!");
    }, 1000); // Aguardar 1 segundo após o DOM ser carregado
});

/**
 * Inicializa as opções de configuração de preenchimento para caminhos
 * Adiciona elementos HTML necessários e configura eventos
 */
function initPathFillOptions() {
    try {
        // Selecionar o menu de edição de caminhos
        const pathEditMenu = document.getElementById('pathEditMenu');
        
        if (!pathEditMenu) {
            console.error("Menu de edição de caminhos não encontrado!");
            return;
        }
        
        // Verificar se os elementos já existem (para evitar duplicação)
        if (document.getElementById('pathFillToggle')) {
            console.log("Elementos de preenchimento de path já existem, atualizando event listeners.");
            updatePathFillEventListeners();
            return;
        }
        
        // Criar elementos para toggle de preenchimento, cor e opacidade
        const fillToggleHTML = `
            <div class="form-group">
                <label for="pathFillToggle">
                    <input type="checkbox" id="pathFillToggle"> Mostrar preenchimento
                </label>
            </div>
            <div class="form-group pathFillOptions" style="display: none;">
                <label for="pathFillColor">Cor do preenchimento:</label>
                <input type="color" id="pathFillColor" value="#cccccc">
            </div>
            <div class="form-group pathFillOptions" style="display: none;">
                <label for="pathFillOpacity">Opacidade do preenchimento: <span id="pathFillOpacityValue">50</span>%</label>
                <input type="range" id="pathFillOpacity" min="0" max="100" value="50" step="1">
            </div>
        `;
        
        // Adicionar elementos ao menu de edição de caminhos (após o último form-group existente)
        const lastFormGroup = pathEditMenu.querySelector('.form-group:last-child');
        if (lastFormGroup) {
            lastFormGroup.insertAdjacentHTML('afterend', fillToggleHTML);
        } else {
            // Se não encontrar um .form-group, adicione ao final do menu
            pathEditMenu.insertAdjacentHTML('beforeend', fillToggleHTML);
        }
        
        // Configura os event listeners
        updatePathFillEventListeners();
        
        // Corrigir o slider de opacidade da linha do path
        fixPathOpacitySlider();
        
        console.log("Elementos de preenchimento de path adicionados com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar opções de preenchimento para caminhos:", error);
    }
}

/**
 * Configura ou atualiza os event listeners para os elementos de preenchimento
 */
function updatePathFillEventListeners() {
    try {
        // Toggle de preenchimento
        const fillToggle = document.getElementById('pathFillToggle');
        const fillOptions = document.querySelectorAll('.pathFillOptions');
        
        // Manipulador para o toggle de preenchimento
        fillToggle.addEventListener('change', function() {
            // Obter o objeto selecionado
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'path') return;
            
            // Mostrar/esconder opções de preenchimento
            fillOptions.forEach(option => {
                option.style.display = this.checked ? 'block' : 'none';
            });
            
            // Aplicar/remover preenchimento
            if (this.checked) {
                // Obter valores dos inputs
                const fillColor = document.getElementById('pathFillColor').value;
                const fillOpacity = parseInt(document.getElementById('pathFillOpacity').value) / 100;
                
                // Converter cor hex para rgba se houver opacidade
                if (fillOpacity < 1) {
                    activeObject.set('fill', hexToRgba(fillColor, fillOpacity));
                } else {
                    activeObject.set('fill', fillColor);
                }
            } else {
                // Remover preenchimento
                activeObject.set('fill', null);
            }
            
            canvas.renderAll();
        });
        
        // Manipulador para a cor de preenchimento
        const fillColor = document.getElementById('pathFillColor');
        fillColor.addEventListener('input', function() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'path') return;
            
            const fillOpacity = parseInt(document.getElementById('pathFillOpacity').value) / 100;
            
            // Converter cor hex para rgba se houver opacidade
            if (fillOpacity < 1) {
                activeObject.set('fill', hexToRgba(this.value, fillOpacity));
            } else {
                activeObject.set('fill', this.value);
            }
            
            canvas.renderAll();
        });
        
        // Manipulador para a opacidade do preenchimento
        const fillOpacity = document.getElementById('pathFillOpacity');
        const fillOpacityValue = document.getElementById('pathFillOpacityValue');
        
        fillOpacity.addEventListener('input', function() {
            // Atualizar o texto do valor da opacidade
            fillOpacityValue.textContent = this.value;
            
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'path') return;
            
            const opacity = parseInt(this.value) / 100;
            const fillColor = document.getElementById('pathFillColor').value;
            
            // Converter cor hex para rgba
            activeObject.set('fill', hexToRgba(fillColor, opacity));
            canvas.renderAll();
        });
        
        // Evento para quando um objeto path é selecionado
        canvas.on('selection:created', updatePathFillUI);
        canvas.on('selection:updated', updatePathFillUI);
        
        console.log("Event listeners para preenchimento de caminhos configurados!");
    } catch (error) {
        console.error("Erro ao configurar event listeners para preenchimento:", error);
    }
}

/**
 * Atualiza a interface do usuário de preenchimento quando um path é selecionado
 */
function updatePathFillUI(e) {
    try {
        const activeObject = e.selected[0];
        if (!activeObject || activeObject.type !== 'path') return;
        
        const fillToggle = document.getElementById('pathFillToggle');
        const fillOptions = document.querySelectorAll('.pathFillOptions');
        const fillColor = document.getElementById('pathFillColor');
        const fillOpacity = document.getElementById('pathFillOpacity');
        const fillOpacityValue = document.getElementById('pathFillOpacityValue');
        
        // Verificar se o path tem preenchimento
        const hasFill = activeObject.fill && activeObject.fill !== '';
        
        // Atualizar o estado do toggle
        fillToggle.checked = hasFill;
        
        // Mostrar/esconder opções de preenchimento
        fillOptions.forEach(option => {
            option.style.display = hasFill ? 'block' : 'none';
        });
        
        if (hasFill) {
            // Extrair cor e opacidade do preenchimento atual
            let color = activeObject.fill;
            let opacity = 100;
            
            // Se a cor é rgba, extrair os valores
            if (typeof color === 'string' && color.startsWith('rgba')) {
                const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
                if (rgba) {
                    // Converter rgb para hex
                    color = rgbToHex(parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3]));
                    opacity = rgba[4] ? Math.round(parseFloat(rgba[4]) * 100) : 100;
                }
            }
            
            // Atualizar os controles
            fillColor.value = color;
            fillOpacity.value = opacity;
            fillOpacityValue.textContent = opacity;
        }
    } catch (error) {
        console.error("Erro ao atualizar UI de preenchimento:", error);
    }
}

/**
 * Corrige o slider de opacidade da linha do path
 */
function fixPathOpacitySlider() {
    try {
        const pathOpacity = document.getElementById('pathOpacity');
        const pathOpacityValue = document.getElementById('pathOpacityValue');
        
        if (!pathOpacity || !pathOpacityValue) {
            console.warn("Elementos de opacidade do path não encontrados!");
            return;
        }
        
        // Remover event listeners existentes
        const newPathOpacity = pathOpacity.cloneNode(true);
        pathOpacity.parentNode.replaceChild(newPathOpacity, pathOpacity);
        
        // Adicionar novo event listener
        newPathOpacity.addEventListener('input', function() {
            const value = parseInt(this.value);
            pathOpacityValue.textContent = value;
            
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'path') return;
            
            activeObject.set('opacity', value / 100);
            canvas.renderAll();
        });
        
        console.log("Slider de opacidade do path corrigido!");
    } catch (error) {
        console.error("Erro ao corrigir slider de opacidade:", error);
    }
}

/**
 * Converte cor hexadecimal para rgba
 * @param {string} hex - Cor em formato hexadecimal (#RRGGBB)
 * @param {number} opacity - Valor de opacidade (0-1)
 * @return {string} - Cor em formato rgba
 */
function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Converte RGB para hexadecimal
 * @param {number} r - Valor de vermelho (0-255)
 * @param {number} g - Valor de verde (0-255)
 * @param {number} b - Valor de azul (0-255)
 * @return {string} - Cor em formato hexadecimal
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}