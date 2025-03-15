/**
 * init.js - Script de inicialização e compatibilidade
 * Este script garante a compatibilidade quando o arquivo principal é renomeado
 * de canvas-editor.html para index.html
 * Autor: Claude 3.7 Sonnet
 * Data: Criado em resposta às necessidades do usuário
 */

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Script de inicialização e compatibilidade carregado!");
    
    // Verificar se estamos na página index.html (anteriormente canvas-editor.html)
    if (window.location.pathname.endsWith('/index.html') || 
        window.location.pathname.endsWith('/') || 
        window.location.pathname === '') {
        
        console.log("Detectada execução na página index.html");
        
        // Verificar se o objeto canvas existe
        setTimeout(function() {
            if (typeof canvas === 'undefined' || !canvas) {
                console.error("Objeto canvas não encontrado! Verificando elementos no DOM...");
                
                // Verificar se há um elemento canvas com id 'c'
                const canvasElement = document.getElementById('c');
                if (canvasElement) {
                    console.log("Elemento canvas encontrado, mas objeto Fabric não inicializado.");
                    attemptCanvasInitialization(canvasElement);
                } else {
                    console.error("Elemento canvas não encontrado! Verifique se o ID do canvas está correto.");
                }
            } else {
                console.log("Objeto canvas encontrado e inicializado corretamente!");
                verifyScriptsLoaded();
            }
        }, 1000);
    }
});

/**
 * Tenta inicializar o objeto canvas do Fabric se ele não foi criado
 * @param {HTMLElement} canvasElement - Elemento canvas do DOM
 */
function attemptCanvasInitialization(canvasElement) {
    try {
        console.log("Tentando inicializar o canvas do Fabric...");
        
        // Verificar se Fabric.js está disponível
        if (typeof fabric === 'undefined') {
            console.error("Fabric.js não está carregado! Verificando script...");
            
            // Verificar se o script fabric.js existe
            const fabricScript = document.querySelector('script[src*="fabric.js"]');
            if (!fabricScript) {
                console.error("Script do Fabric.js não encontrado. Adicione-o antes de todos os outros scripts.");
                injectFabricScript();
            } else {
                console.log("Script do Fabric.js encontrado, mas pode não ter sido carregado corretamente.");
            }
            return;
        }
        
        // Tentar criar um novo objeto canvas do Fabric
        window.canvas = new fabric.Canvas('c');
        console.log("Canvas do Fabric inicializado manualmente!");
        
        // Verificar se funcionou
        if (window.canvas && typeof window.canvas.add === 'function') {
            console.log("Objeto canvas inicializado corretamente!");
            verifyScriptsLoaded();
        } else {
            console.error("Falha ao inicializar o canvas. Verifique a configuração HTML.");
        }
    } catch (error) {
        console.error("Erro ao tentar inicializar o canvas:", error);
    }
}

/**
 * Injeta o script do Fabric.js na página se não estiver presente
 */
function injectFabricScript() {
    console.log("Tentando injetar o script do Fabric.js...");
    
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
    script.onload = function() {
        console.log("Fabric.js carregado com sucesso!");
        
        // Tentar inicializar o canvas após o carregamento do Fabric
        const canvasElement = document.getElementById('c');
        if (canvasElement) {
            setTimeout(function() {
                attemptCanvasInitialization(canvasElement);
            }, 500);
        }
    };
    script.onerror = function() {
        console.error("Falha ao carregar o Fabric.js da CDN.");
    };
    
    document.head.appendChild(script);
}

/**
 * Verifica se todos os scripts necessários foram carregados
 */
function verifyScriptsLoaded() {
    // Lista de scripts que devem estar carregados
    const requiredScripts = [
        'undo-redo-fix.js',
        'menu-fix.js',
        'path-fill-fix.js',
        'text-shadow-fix.js',
        'order-menu-fix.js'
    ];
    
    // Verificar cada script
    let allLoaded = true;
    let missingScripts = [];
    
    // Verificar scripts carregados
    const loadedScripts = Array.from(document.querySelectorAll('script')).map(script => {
        const src = script.src || '';
        return src.substring(src.lastIndexOf('/') + 1);
    });
    
    // Identificar scripts ausentes
    requiredScripts.forEach(script => {
        if (!loadedScripts.some(src => src.includes(script))) {
            allLoaded = false;
            missingScripts.push(script);
        }
    });
    
    if (allLoaded) {
        console.log("Todos os scripts necessários foram carregados!");
    } else {
        console.warn("Alguns scripts podem estar faltando:", missingScripts);
        console.log("Verificando se precisa inicializar manualmente alguma funcionalidade...");
        
        // Inicializar manualmente funcionalidades que podem estar faltando
        if (typeof initUndoRedoFix === 'function') {
            console.log("Inicializando correção de undo/redo manualmente...");
            initUndoRedoFix();
        }
        
        if (typeof initMenuFix === 'function') {
            console.log("Inicializando correção de menus manualmente...");
            initMenuFix();
        }
        
        if (typeof initPathFillOptions === 'function') {
            console.log("Inicializando opções de preenchimento para caminhos manualmente...");
            initPathFillOptions();
        }
        
        if (typeof initTextShadowAndAlignment === 'function') {
            console.log("Inicializando opções de sombra e alinhamento para texto manualmente...");
            initTextShadowAndAlignment();
        }
        
        if (typeof initOrderMenu === 'function') {
            console.log("Inicializando menu de ordenação manualmente...");
            initOrderMenu();
        }
    }
    
    // Verificar se o canvas tem os métodos necessários
    checkCanvasMethods();
}

/**
 * Verifica se o objeto canvas possui todos os métodos necessários
 */
function checkCanvasMethods() {
    if (!window.canvas) return;
    
    // Verificar métodos de histórico
    if (!canvas.undo || !canvas.redo) {
        console.warn("Métodos undo/redo não encontrados no canvas. Inicializando implementação alternativa...");
        
        if (typeof implementCustomUndoRedo === 'function') {
            implementCustomUndoRedo();
        } else {
            console.error("Função implementCustomUndoRedo não disponível.");
        }
    }
}