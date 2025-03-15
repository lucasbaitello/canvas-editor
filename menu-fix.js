/**
 * menu-fix.js - Correção para exibição dos menus de configuração
 * Este script corrige problemas de exibição dos menus de configuração quando elementos são selecionados
 * Autor: Claude 3.7 Sonnet
 * Data: Criado em resposta às necessidades do usuário
 */

// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que o canvas e outros elementos sejam carregados
    setTimeout(function() {
        // Inicializar a correção dos menus de configuração
        initMenuFix();
        console.log("✅ Correção de menus de configuração inicializada!");
    }, 1000); // Aguardar 1 segundo após o DOM ser carregado
});

/**
 * Inicializa a correção dos menus de configuração
 * Garante que os menus sejam exibidos corretamente quando elementos são selecionados
 */
function initMenuFix() {
    try {
        console.log("Iniciando correção dos menus de configuração...");
        
        // Verificar se o objeto canvas está disponível
        if (typeof canvas === 'undefined') {
            console.error("Objeto canvas não encontrado!");
            return;
        }
        
        // Remover eventos antigos para evitar duplicação
        canvas.off('selection:created');
        canvas.off('selection:updated');
        canvas.off('mouse:dblclick');
        
        // Adicionar novo listener para seleção criada
        canvas.on('selection:created', function(options) {
            handleSelection(options, 'selection:created');
        });
        
        // Adicionar novo listener para seleção atualizada
        canvas.on('selection:updated', function(options) {
            handleSelection(options, 'selection:updated');
        });
        
        // Adicionar novo listener para duplo clique
        canvas.on('mouse:dblclick', function(options) {
            if (options.target) {
                handleSelection({ selected: [options.target] }, 'mouse:dblclick');
            }
        });
        
        console.log("Listeners de seleção e duplo clique reconfigurados!");
        
        // Verificar e ajustar a função showConfigMenuForObject
        patchShowConfigMenuFunction();
        
        console.log("Correção de menus aplicada com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar correção de menus:", error);
    }
}

/**
 * Manipula eventos de seleção e exibe o menu de configuração apropriado
 * @param {Object} options - Opções do evento de seleção
 * @param {string} eventType - Tipo de evento que disparou a seleção
 */
function handleSelection(options, eventType) {
    try {
        console.log(`Evento ${eventType} detectado:`, options);
        
        if (!options.selected || options.selected.length === 0) {
            console.log("Nenhum objeto selecionado.");
            return;
        }
        
        // Obter o primeiro objeto selecionado (ou o único)
        const obj = options.selected[0];
        if (!obj) {
            console.log("Objeto selecionado inválido.");
            return;
        }
        
        console.log(`Objeto do tipo '${obj.type}' selecionado. Exibindo menu...`);
        
        // Ocultar todos os menus de configuração primeiro
        hideAllConfigMenus();
        
        // Exibir o menu apropriado com base no tipo de objeto
        switch (obj.type) {
            case 'i-text':
            case 'text':
            case 'textbox':
                showTextMenu(obj);
                break;
            case 'image':
                showImageMenu(obj);
                break;
            case 'path':
                showPathMenu(obj);
                break;
            case 'rect':
            case 'circle':
            case 'triangle':
            case 'polygon':
            case 'line':
                showShapeMenu(obj);
                break;
            default:
                console.log(`Tipo de objeto '${obj.type}' não tem menu específico.`);
                // Tentar exibir o menu de formas como fallback
                if (typeof showShapeMenu === 'function') {
                    showShapeMenu(obj);
                }
        }
        
        // Verificar se o menu está visível após um curto atraso
        setTimeout(verifyMenuVisibility, 200, obj);
        
    } catch (error) {
        console.error("Erro ao manipular seleção:", error);
    }
}

/**
 * Verifica se o menu de configuração está realmente visível após a tentativa de exibição
 * @param {Object} obj - Objeto selecionado
 */
function verifyMenuVisibility(obj) {
    try {
        if (!obj) return;
        
        // Mapear tipos de objetos para IDs de menus
        const menuTypes = {
            'i-text': 'textEditMenu',
            'text': 'textEditMenu',
            'textbox': 'textEditMenu',
            'path': 'pathEditMenu',
            'image': 'imageMenu',
            'rect': 'shapeConfigMenu',
            'circle': 'shapeConfigMenu',
            'triangle': 'shapeConfigMenu',
            'polygon': 'shapeConfigMenu',
            'line': 'shapeConfigMenu'
        };
        
        const menuId = menuTypes[obj.type] || 'shapeConfigMenu';
        const menu = document.getElementById(menuId);
        
        if (!menu) {
            console.error(`Menu ${menuId} não encontrado no DOM!`);
            return;
        }
        
        console.log(`Verificando visibilidade do menu ${menuId}: display=${menu.style.display}, zIndex=${menu.style.zIndex}`);
        
        // Se o menu não estiver visível, forçar a exibição
        if (menu.style.display !== 'block') {
            console.warn(`Menu ${menuId} não está visível, forçando exibição...`);
            menu.style.display = 'block';
            menu.style.zIndex = '1001';
            
            // Dependendo do tipo de objeto, atualizar o conteúdo do menu
            if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
                updateTextMenu(obj);
            } else if (obj.type === 'image') {
                updateImageMenu(obj);
            } else if (obj.type === 'path') {
                updatePathMenu(obj);
            } else {
                updateShapeMenu(obj);
            }
        }
    } catch (error) {
        console.error("Erro ao verificar visibilidade do menu:", error);
    }
}

/**
 * Oculta todos os menus de configuração
 */
function hideAllConfigMenus() {
    try {
        // Lista de IDs de todos os menus de configuração
        const menuIds = [
            'textEditMenu',
            'imageMenu',
            'pathEditMenu',
            'shapeConfigMenu',
            'drawingMenu'
        ];
        
        // Ocultar cada menu
        menuIds.forEach(id => {
            const menu = document.getElementById(id);
            if (menu) {
                menu.style.display = 'none';
                if (menu.classList.contains('active')) {
                    menu.classList.remove('active');
                }
            }
        });
        
        console.log("Todos os menus de configuração foram ocultados");
    } catch (error) {
        console.error("Erro ao ocultar menus de configuração:", error);
    }
}

/**
 * Modifica a função showConfigMenuForObject original ou cria uma nova se não existir
 */
function patchShowConfigMenuFunction() {
    try {
        // Verificar se a função existe
        if (typeof window.showConfigMenuForObject === 'function') {
            console.log("Substituindo função showConfigMenuForObject existente...");
            
            // Salvar a função original para referência
            window.originalShowConfigMenuForObject = window.showConfigMenuForObject;
            
            // Substituir com nova implementação
            window.showConfigMenuForObject = function(obj, eventType) {
                try {
                    console.log(`showConfigMenuForObject chamado para objeto do tipo '${obj.type}' por evento '${eventType}'`);
                    
                    // Chamar a implementação deste script
                    handleSelection({ selected: [obj] }, eventType);
                    
                } catch (error) {
                    console.error("Erro na função showConfigMenuForObject:", error);
                    
                    // Tentar chamar a função original como fallback
                    try {
                        window.originalShowConfigMenuForObject(obj, eventType);
                    } catch (fallbackError) {
                        console.error("Erro ao chamar função original como fallback:", fallbackError);
                    }
                }
            };
            
            console.log("Função showConfigMenuForObject substituída com sucesso!");
        } else {
            console.warn("Função showConfigMenuForObject não encontrada, criando nova implementação...");
            
            // Criar uma nova implementação
            window.showConfigMenuForObject = function(obj, eventType) {
                handleSelection({ selected: [obj] }, eventType);
            };
            
            console.log("Nova função showConfigMenuForObject criada!");
        }
    } catch (error) {
        console.error("Erro ao modificar função showConfigMenuForObject:", error);
    }
}

/**
 * Atualiza o menu de texto com valores do objeto selecionado
 * @param {Object} textObj - Objeto de texto selecionado
 */
function updateTextMenu(textObj) {
    try {
        // Verificar se os elementos do menu existem
        const elements = [
            { id: 'fontFamily', prop: 'fontFamily', defaultValue: 'Arial' },
            { id: 'fontSize', prop: 'fontSize', defaultValue: 20 },
            { id: 'fontSizeValue', prop: 'fontSize', defaultValue: 20, isLabel: true },
            { id: 'textColor', prop: 'fill', defaultValue: '#000000' },
            { id: 'textOpacity', prop: 'opacity', defaultValue: 100, multiplier: 100 },
            { id: 'textOpacityValue', prop: 'opacity', defaultValue: 100, multiplier: 100, isLabel: true },
            { id: 'textBgColor', prop: 'backgroundColor', defaultValue: '#ffffff' }
        ];
        
        // Atualizar cada elemento
        elements.forEach(elem => {
            const element = document.getElementById(elem.id);
            if (!element) return;
            
            let value = textObj[elem.prop];
            
            // Aplicar valor padrão se não existir
            if (value === undefined || value === null) {
                value = elem.defaultValue;
            }
            
            // Aplicar multiplicador (por exemplo, para converter 0-1 em 0-100)
            if (elem.multiplier) {
                value = Math.round(value * elem.multiplier);
            }
            
            // Atualizar o valor do elemento
            if (elem.isLabel) {
                element.textContent = value;
            } else {
                element.value = value;
            }
        });
        
        console.log("Menu de texto atualizado com valores do objeto!");
    } catch (error) {
        console.error("Erro ao atualizar menu de texto:", error);
    }
}

/**
 * Atualiza o menu de imagem com valores do objeto selecionado
 * @param {Object} imgObj - Objeto de imagem selecionado
 */
function updateImageMenu(imgObj) {
    try {
        // Verificar se os elementos do menu existem
        const elements = [
            { id: 'imageOpacity', prop: 'opacity', defaultValue: 100, multiplier: 100 },
            { id: 'imageOpacityValue', prop: 'opacity', defaultValue: 100, multiplier: 100, isLabel: true },
            { id: 'imageBorderWidth', prop: 'strokeWidth', defaultValue: 0 },
            { id: 'imageBorderWidthValue', prop: 'strokeWidth', defaultValue: 0, isLabel: true },
            { id: 'imageBorderColor', prop: 'stroke', defaultValue: '#000000' }
        ];
        
        // Atualizar cada elemento
        elements.forEach(elem => {
            const element = document.getElementById(elem.id);
            if (!element) return;
            
            let value = imgObj[elem.prop];
            
            // Aplicar valor padrão se não existir
            if (value === undefined || value === null) {
                value = elem.defaultValue;
            }
            
            // Aplicar multiplicador (por exemplo, para converter 0-1 em 0-100)
            if (elem.multiplier) {
                value = Math.round(value * elem.multiplier);
            }
            
            // Atualizar o valor do elemento
            if (elem.isLabel) {
                element.textContent = value;
            } else {
                element.value = value;
            }
        });
        
        console.log("Menu de imagem atualizado com valores do objeto!");
    } catch (error) {
        console.error("Erro ao atualizar menu de imagem:", error);
    }
}

/**
 * Atualiza o menu de caminho com valores do objeto selecionado
 * @param {Object} pathObj - Objeto de caminho selecionado
 */
function updatePathMenu(pathObj) {
    try {
        // Verificar se os elementos do menu existem
        const elements = [
            { id: 'pathStrokeWidth', prop: 'strokeWidth', defaultValue: 5 },
            { id: 'pathStrokeWidthValue', prop: 'strokeWidth', defaultValue: 5, isLabel: true },
            { id: 'pathStrokeColor', prop: 'stroke', defaultValue: '#000000' },
            { id: 'pathOpacity', prop: 'opacity', defaultValue: 100, multiplier: 100 },
            { id: 'pathOpacityValue', prop: 'opacity', defaultValue: 100, multiplier: 100, isLabel: true }
        ];
        
        // Atualizar cada elemento
        elements.forEach(elem => {
            const element = document.getElementById(elem.id);
            if (!element) return;
            
            let value = pathObj[elem.prop];
            
            // Aplicar valor padrão se não existir
            if (value === undefined || value === null) {
                value = elem.defaultValue;
            }
            
            // Aplicar multiplicador (por exemplo, para converter 0-1 em 0-100)
            if (elem.multiplier) {
                value = Math.round(value * elem.multiplier);
            }
            
            // Atualizar o valor do elemento
            if (elem.isLabel) {
                element.textContent = value;
            } else {
                element.value = value;
            }
        });
        
        // Verificar se há elementos de preenchimento (adicionados pelo path-fill-fix.js)
        const fillToggle = document.getElementById('pathFillToggle');
        if (fillToggle) {
            const hasFill = pathObj.fill && pathObj.fill !== '';
            fillToggle.checked = hasFill;
            
            const fillOptions = document.querySelectorAll('.pathFillOptions');
            fillOptions.forEach(option => {
                option.style.display = hasFill ? 'block' : 'none';
            });
            
            if (hasFill) {
                // Atualizar cor de preenchimento
                const fillColor = document.getElementById('pathFillColor');
                if (fillColor) fillColor.value = pathObj.fill;
            }
        }
        
        console.log("Menu de caminho atualizado com valores do objeto!");
    } catch (error) {
        console.error("Erro ao atualizar menu de caminho:", error);
    }
}

/**
 * Atualiza o menu de forma com valores do objeto selecionado
 * @param {Object} shapeObj - Objeto de forma selecionado
 */
function updateShapeMenu(shapeObj) {
    try {
        // Verificar se os elementos do menu existem
        const elements = [
            { id: 'shapeStrokeColor', prop: 'stroke', defaultValue: '#000000' },
            { id: 'shapeStrokeWidth', prop: 'strokeWidth', defaultValue: 2 },
            { id: 'shapeStrokeWidthValue', prop: 'strokeWidth', defaultValue: 2, isLabel: true },
            { id: 'shapeFillColor', prop: 'fill', defaultValue: '#ffffff' },
            { id: 'shapeOpacity', prop: 'opacity', defaultValue: 100, multiplier: 100 },
            { id: 'shapeOpacityValue', prop: 'opacity', defaultValue: 100, multiplier: 100, isLabel: true }
        ];
        
        // Atualizar cada elemento
        elements.forEach(elem => {
            const element = document.getElementById(elem.id);
            if (!element) return;
            
            let value = shapeObj[elem.prop];
            
            // Aplicar valor padrão se não existir
            if (value === undefined || value === null) {
                value = elem.defaultValue;
            }
            
            // Aplicar multiplicador (por exemplo, para converter 0-1 em 0-100)
            if (elem.multiplier) {
                value = Math.round(value * elem.multiplier);
            }
            
            // Atualizar o valor do elemento
            if (elem.isLabel) {
                element.textContent = value;
            } else {
                element.value = value;
            }
        });
        
        console.log("Menu de forma atualizado com valores do objeto!");
    } catch (error) {
        console.error("Erro ao atualizar menu de forma:", error);
    }
}