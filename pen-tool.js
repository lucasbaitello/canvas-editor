/**
 * pen-tool.js - Implementa uma ferramenta de caneta vetorial para o Fabric.js
 * Autor: Claude 3.7 Sonnet
 * Data: Criado em resposta às necessidades do usuário
 */

// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    initPenTool();
});

/**
 * Variáveis globais para controle da ferramenta de caneta
 */
let penMode = false;                // Indica se o modo caneta está ativo
let isDrawing = false;              // Indica se está desenhando atualmente
let currentPath = null;             // Caminho atual sendo desenhado
let currentPathPoints = [];         // Pontos do caminho atual
let selectedPoint = null;           // Ponto selecionado para edição
let selectedControlPoint = null;    // Ponto de controle selecionado
let editMode = false;               // Modo de edição de pontos
let pointRadius = 5;                // Raio dos pontos de controle
let points = [];                    // Array de pontos do caminho

/**
 * Inicializa a ferramenta de caneta
 */
function initPenTool() {
    try {
        console.log("Inicializando ferramenta de caneta vetorial...");
        
        // Verificar se o canvas está disponível
        if (!window.canvas || typeof window.canvas.add !== 'function') {
            console.error("Canvas não encontrado ou não é um objeto Fabric.js");
            setTimeout(initPenTool, 1000); // Tentar novamente após 1 segundo
            return;
        }
        
        // Adicionar botão para ativar o modo de caneta
        addPenToolButton();
        
        // Configurar estilos CSS para a ferramenta
        addPenToolStyles();
        
        // Configurar eventos para a ferramenta de caneta
        setupPenToolEvents();
        
        console.log("Ferramenta de caneta vetorial inicializada com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar ferramenta de caneta:", error);
    }
}

/**
 * Adiciona botão para ativar o modo de caneta
 */
function addPenToolButton() {
    try {
        // Verificar se existem outros botões de ferramentas para adicionar junto
        const toolbarContainer = document.querySelector('.toolbar, .canvas-tools, [data-tool="toolbar"], #toolbox');
        
        if (!toolbarContainer) {
            // Se não encontrar uma toolbar, criar uma
            const canvasContainer = document.querySelector('.canvas-container, #canvas-wrapper');
            
            if (canvasContainer) {
                const newToolbar = document.createElement('div');
                newToolbar.className = 'canvas-toolbar';
                newToolbar.style.position = 'absolute';
                newToolbar.style.top = '10px';
                newToolbar.style.left = '10px';
                newToolbar.style.zIndex = '100';
                canvasContainer.parentNode.insertBefore(newToolbar, canvasContainer);
                
                createPenButton(newToolbar);
            } else {
                console.error("Não foi possível encontrar um container adequado para a barra de ferramentas");
            }
        } else {
            // Usar a toolbar existente
            createPenButton(toolbarContainer);
        }
    } catch (error) {
        console.error("Erro ao adicionar botão da ferramenta de caneta:", error);
    }
}

/**
 * Cria o botão da ferramenta de caneta
 * @param {HTMLElement} container - Container onde o botão será adicionado
 */
function createPenButton(container) {
    // Criar o botão de ferramenta de caneta
    const penButton = document.createElement('button');
    penButton.id = 'pen-tool-button';
    penButton.className = 'tool-button';
    penButton.title = 'Ferramenta de Caneta Vetorial';
    penButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"
                  fill="currentColor"/>
        </svg>
    `;
    
    // Adicionar evento de clique
    penButton.addEventListener('click', togglePenMode);
    
    // Adicionar botão ao container
    container.appendChild(penButton);
    
    // Criar o painel de opções da caneta (inicialmente oculto)
    const penOptions = document.createElement('div');
    penOptions.id = 'pen-tool-options';
    penOptions.className = 'tool-options';
    penOptions.style.display = 'none';
    penOptions.innerHTML = `
        <button id="pen-tool-draw" class="option-button active" title="Modo Desenho">Desenhar</button>
        <button id="pen-tool-edit" class="option-button" title="Modo Edição de Pontos">Editar Pontos</button>
        <button id="pen-tool-finish" class="option-button" title="Finalizar Caminho">Finalizar</button>
        <button id="pen-tool-cancel" class="option-button" title="Cancelar">Cancelar</button>
    `;
    
    container.appendChild(penOptions);
    
    // Configurar eventos para os botões de opções
    document.getElementById('pen-tool-draw').addEventListener('click', () => {
        editMode = false;
        updateOptionsButtonsState();
    });
    
    document.getElementById('pen-tool-edit').addEventListener('click', () => {
        editMode = true;
        updateOptionsButtonsState();
    });
    
    document.getElementById('pen-tool-finish').addEventListener('click', finishPath);
    document.getElementById('pen-tool-cancel').addEventListener('click', cancelPath);
}

/**
 * Atualiza o estado visual dos botões de opções
 */
function updateOptionsButtonsState() {
    const drawButton = document.getElementById('pen-tool-draw');
    const editButton = document.getElementById('pen-tool-edit');
    
    if (editMode) {
        drawButton.classList.remove('active');
        editButton.classList.add('active');
    } else {
        drawButton.classList.add('active');
        editButton.classList.remove('active');
    }
}

/**
 * Adiciona estilos CSS necessários para a ferramenta de caneta
 */
function addPenToolStyles() {
    const penToolStyles = document.createElement('style');
    penToolStyles.id = 'pen-tool-styles';
    penToolStyles.textContent = `
        /* Estilos para botões da ferramenta de caneta */
        .tool-button {
            width: 36px;
            height: 36px;
            margin: 4px;
            padding: 6px;
            border-radius: 4px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .tool-button:hover {
            background-color: #e9ecef;
            border-color: #ced4da;
        }
        
        .tool-button.active {
            background-color: #e7f5ff;
            border-color: #74c0fc;
            color: #1971c2;
        }
        
        /* Estilos para o painel de opções */
        .tool-options {
            margin: 4px;
            padding: 6px;
            border-radius: 4px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            display: flex;
            flex-wrap: wrap;
        }
        
        .option-button {
            margin: 2px;
            padding: 4px 8px;
            border-radius: 3px;
            background-color: #ffffff;
            border: 1px solid #ced4da;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        
        .option-button:hover {
            background-color: #e9ecef;
        }
        
        .option-button.active {
            background-color: #e7f5ff;
            border-color: #74c0fc;
            color: #1971c2;
        }
        
        /* Estilos para os pontos de controle */
        .control-point {
            fill: white;
            stroke: #1971c2;
            stroke-width: 2;
            cursor: move;
        }
        
        .control-point:hover, .control-point.selected {
            fill: #74c0fc;
        }
        
        .bezier-handle {
            fill: #74c0fc;
            stroke: #1971c2;
            stroke-width: 1;
            cursor: move;
        }
        
        .bezier-handle-line {
            stroke: #74c0fc;
            stroke-width: 1;
            stroke-dasharray: 3,3;
        }
    `;
    
    document.head.appendChild(penToolStyles);
}

/**
 * Configura eventos para a ferramenta de caneta
 */
function setupPenToolEvents() {
    // Evento de mouse down no canvas
    window.canvas.on('mouse:down', onMouseDown);
    
    // Evento de mouse move no canvas
    window.canvas.on('mouse:move', onMouseMove);
    
    // Evento de mouse up no canvas
    window.canvas.on('mouse:up', onMouseUp);
    
    // Adicionar manipulador para teclas (Esc para cancelar, Delete para remover pontos)
    document.addEventListener('keydown', onKeyDown);
}

/**
 * Alterna o modo de caneta
 */
function togglePenMode() {
    penMode = !penMode;
    
    // Atualizar aparência do botão
    const penButton = document.getElementById('pen-tool-button');
    if (penButton) {
        if (penMode) {
            penButton.classList.add('active');
        } else {
            penButton.classList.remove('active');
        }
    }
    
    // Mostrar/esconder opções
    const penOptions = document.getElementById('pen-tool-options');
    if (penOptions) {
        penOptions.style.display = penMode ? 'flex' : 'none';
    }
    
    // Definir modo de seleção do canvas
    if (penMode) {
        // Desabilitar seleção para permitir desenho
        window.canvas.selection = false;
        window.canvas.forEachObject(function(obj) {
            obj.selectable = false;
        });
        
        // Iniciar um novo caminho
        startNewPath();
    } else {
        // Restaurar seleção normal
        window.canvas.selection = true;
        window.canvas.forEachObject(function(obj) {
            obj.selectable = true;
        });
        
        // Limpar os pontos temporários
        clearTemporaryElements();
    }
    
    // Renderizar canvas
    window.canvas.requestRenderAll();
}

/**
 * Inicia um novo caminho
 */
function startNewPath() {
    // Limpar pontos anteriores
    points = [];
    currentPathPoints = [];
    
    // Criar objeto de caminho vazio
    currentPath = new fabric.Path('M 0 0', {
        fill: '',
        stroke: 'black',
        strokeWidth: 2,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        objectCaching: false,
        selectable: false,
        evented: false
    });
    
    // Adicionar ao canvas
    window.canvas.add(currentPath);
    
    // Entrar no modo de desenho
    isDrawing = true;
    editMode = false;
    
    // Atualizar estado dos botões
    updateOptionsButtonsState();
}

/**
 * Manipulador de evento para mouse down
 * @param {Object} opt - Objeto de evento do Fabric.js
 */
function onMouseDown(opt) {
    if (!penMode) return;
    
    const pointer = window.canvas.getPointer(opt.e);
    
    if (editMode) {
        // Verificar se clicou em um ponto existente
        selectedPoint = findClickedPoint(pointer);
        
        if (!selectedPoint && !isDrawing) {
            // Verificar se clicou em um ponto de controle Bezier
            selectedControlPoint = findClickedControlPoint(pointer);
        }
    } else {
        if (!isDrawing) {
            startNewPath();
        }
        
        // Adicionar novo ponto
        addPoint(pointer.x, pointer.y);
    }
    
    window.canvas.requestRenderAll();
}

/**
 * Manipulador de evento para mouse move
 * @param {Object} opt - Objeto de evento do Fabric.js
 */
function onMouseMove(opt) {
    if (!penMode) return;
    
    const pointer = window.canvas.getPointer(opt.e);
    
    if (editMode) {
        if (selectedPoint) {
            // Mover ponto selecionado
            movePoint(selectedPoint, pointer);
        } else if (selectedControlPoint) {
            // Mover ponto de controle Bezier
            moveControlPoint(selectedControlPoint, pointer);
        }
    } else if (isDrawing && points.length > 0) {
        // Atualizar visualização prévia da linha
        updatePreviewLine(pointer);
    }
    
    window.canvas.requestRenderAll();
}

/**
 * Manipulador de evento para mouse up
 */
function onMouseUp() {
    if (!penMode) return;
    
    selectedPoint = null;
    selectedControlPoint = null;
    
    window.canvas.requestRenderAll();
}

/**
 * Manipulador de evento para teclas
 * @param {KeyboardEvent} e - Evento de teclado
 */
function onKeyDown(e) {
    if (!penMode) return;
    
    // Esc para cancelar o caminho
    if (e.key === 'Escape') {
        cancelPath();
    }
    
    // Delete para remover ponto selecionado
    if (e.key === 'Delete' && editMode && selectedPoint) {
        removePoint(selectedPoint);
        selectedPoint = null;
        window.canvas.requestRenderAll();
    }
    
    // Enter para finalizar o caminho
    if (e.key === 'Enter') {
        finishPath();
    }
}

/**
 * Adiciona um novo ponto ao caminho
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 */
function addPoint(x, y) {
    // Criar ponto
    const point = {
        x: x,
        y: y,
        controlPoint1: { x: x - 20, y: y - 20 },
        controlPoint2: { x: x + 20, y: y + 20 }
    };
    
    // Adicionar ao array de pontos
    points.push(point);
    
    // Adicionar ao array de pontos do caminho atual
    currentPathPoints.push(point);
    
    // Desenhar ponto no canvas
    drawPoint(point);
    
    // Atualizar caminho
    updatePath();
}

/**
 * Desenha um ponto no canvas
 * @param {Object} point - Ponto a ser desenhado
 */
function drawPoint(point) {
    // Criar círculo para o ponto
    const circle = new fabric.Circle({
        left: point.x - pointRadius,
        top: point.y - pointRadius,
        radius: pointRadius,
        fill: 'white',
        stroke: '#1971c2',
        strokeWidth: 2,
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'control-point',
        data: point
    });
    
    // Adicionar ao canvas
    window.canvas.add(circle);
    
    // Desenhar controles Bezier
    if (points.length > 1) {
        drawBezierControls(point);
    }
}

/**
 * Desenha controles de Bezier para um ponto
 * @param {Object} point - Ponto para o qual desenhar controles
 */
function drawBezierControls(point) {
    // Criar círculo para o controle Bezier 1
    const control1 = new fabric.Circle({
        left: point.controlPoint1.x - 3,
        top: point.controlPoint1.y - 3,
        radius: 3,
        fill: '#74c0fc',
        stroke: '#1971c2',
        strokeWidth: 1,
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'bezier-control',
        data: { point: point, handle: 1 }
    });
    
    // Linha do ponto ao controle 1
    const line1 = new fabric.Line([
        point.x, point.y,
        point.controlPoint1.x, point.controlPoint1.y
    ], {
        stroke: '#74c0fc',
        strokeWidth: 1,
        strokeDashArray: [3, 3],
        selectable: false,
        evented: false,
        name: 'bezier-line',
        data: { point: point, handle: 1 }
    });
    
    // Criar círculo para o controle Bezier 2
    const control2 = new fabric.Circle({
        left: point.controlPoint2.x - 3,
        top: point.controlPoint2.y - 3,
        radius: 3,
        fill: '#74c0fc',
        stroke: '#1971c2',
        strokeWidth: 1,
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'bezier-control',
        data: { point: point, handle: 2 }
    });
    
    // Linha do ponto ao controle 2
    const line2 = new fabric.Line([
        point.x, point.y,
        point.controlPoint2.x, point.controlPoint2.y
    ], {
        stroke: '#74c0fc',
        strokeWidth: 1,
        strokeDashArray: [3, 3],
        selectable: false,
        evented: false,
        name: 'bezier-line',
        data: { point: point, handle: 2 }
    });
    
    // Adicionar ao canvas
    window.canvas.add(line1, control1, line2, control2);
}

/**
 * Encontra um ponto que foi clicado
 * @param {Object} pointer - Coordenadas do ponteiro
 * @returns {Object|null} Ponto encontrado ou null
 */
function findClickedPoint(pointer) {
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const distance = Math.sqrt(
            Math.pow(point.x - pointer.x, 2) + 
            Math.pow(point.y - pointer.y, 2)
        );
        
        if (distance <= pointRadius) {
            return point;
        }
    }
    
    return null;
}

/**
 * Encontra um ponto de controle Bezier que foi clicado
 * @param {Object} pointer - Coordenadas do ponteiro
 * @returns {Object|null} Informação do ponto de controle encontrado ou null
 */
function findClickedControlPoint(pointer) {
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        // Verificar controle 1
        const distance1 = Math.sqrt(
            Math.pow(point.controlPoint1.x - pointer.x, 2) + 
            Math.pow(point.controlPoint1.y - pointer.y, 2)
        );
        
        if (distance1 <= 5) {
            return { point: point, handle: 1 };
        }
        
        // Verificar controle 2
        const distance2 = Math.sqrt(
            Math.pow(point.controlPoint2.x - pointer.x, 2) + 
            Math.pow(point.controlPoint2.y - pointer.y, 2)
        );
        
        if (distance2 <= 5) {
            return { point: point, handle: 2 };
        }
    }
    
    return null;
}

/**
 * Move um ponto para novas coordenadas
 * @param {Object} point - Ponto a ser movido
 * @param {Object} pointer - Novas coordenadas
 */
function movePoint(point, pointer) {
    // Calcular deslocamento
    const dx = pointer.x - point.x;
    const dy = pointer.y - point.y;
    
    // Atualizar posição do ponto
    point.x = pointer.x;
    point.y = pointer.y;
    
    // Mover também os pontos de controle
    point.controlPoint1.x += dx;
    point.controlPoint1.y += dy;
    point.controlPoint2.x += dx;
    point.controlPoint2.y += dy;
    
    // Atualizar visualização
    updateControlPointsVisual();
    
    // Atualizar caminho
    updatePath();
}

/**
 * Move um ponto de controle Bezier
 * @param {Object} controlPoint - Informação do ponto de controle
 * @param {Object} pointer - Novas coordenadas
 */
function moveControlPoint(controlPoint, pointer) {
    if (controlPoint.handle === 1) {
        controlPoint.point.controlPoint1.x = pointer.x;
        controlPoint.point.controlPoint1.y = pointer.y;
    } else {
        controlPoint.point.controlPoint2.x = pointer.x;
        controlPoint.point.controlPoint2.y = pointer.y;
    }
    
    // Atualizar visualização
    updateControlPointsVisual();
    
    // Atualizar caminho
    updatePath();
}

/**
 * Atualiza a visualização dos pontos de controle
 */
function updateControlPointsVisual() {
    // Remover pontos de controle existentes
    window.canvas.getObjects().forEach(obj => {
        if (obj.name === 'control-point' || obj.name === 'bezier-control' || obj.name === 'bezier-line') {
            window.canvas.remove(obj);
        }
    });
    
    // Redesenhar pontos
    points.forEach(point => {
        drawPoint(point);
    });
}

/**
 * Atualiza linha de visualização prévia
 * @param {Object} pointer - Coordenadas atuais do mouse
 */
function updatePreviewLine(pointer) {
    if (points.length === 0) return;
    
    // Obter último ponto
    const lastPoint = points[points.length - 1];
    
    // Atualizar caminho para mostrar linha de preview
    const tempPath = generatePathData();
    tempPath += ` L ${pointer.x} ${pointer.y}`;
    
    currentPath.set({ path: tempPath });
}

/**
 * Gera string de dados de caminho SVG
 * @returns {string} String de caminho SVG
 */
function generatePathData() {
    if (points.length === 0) return '';
    
    let pathData = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
        const current = points[i];
        const previous = points[i - 1];
        
        // Usar curva de Bezier cúbica
        pathData += ` C ${previous.controlPoint2.x} ${previous.controlPoint2.y}, ${current.controlPoint1.x} ${current.controlPoint1.y}, ${current.x} ${current.y}`;
    }
    
    return pathData;
}

/**
 * Atualiza o caminho com base nos pontos atuais
 */
function updatePath() {
    if (!currentPath) return;
    
    const pathData = generatePathData();
    currentPath.set({ path: pathData });
}

/**
 * Remove um ponto do caminho
 * @param {Object} point - Ponto a ser removido
 */
function removePoint(point) {
    // Encontrar índice do ponto
    const index = points.findIndex(p => p === point);
    
    if (index !== -1) {
        // Remover do array
        points.splice(index, 1);
        
        // Atualizar visualização
        updateControlPointsVisual();
        
        // Atualizar caminho
        updatePath();
    }
}

/**
 * Finaliza o caminho atual
 */
function finishPath() {
    if (!currentPath || points.length < 2) {
        cancelPath();
        return;
    }
    
    // Criar caminho final
    const finalPath = new fabric.Path(currentPath.path, {
        fill: '',
        stroke: 'black',
        strokeWidth: 2,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        objectCaching: false,
        selectable: true
    });
    
    // Adicionar ao canvas
    window.canvas.add(finalPath);
    
    // Selecionar o novo caminho
    window.canvas.setActiveObject(finalPath);
    
    // Limpar temporários
    clearTemporaryElements();
    
    // Se houver função para salvar estado
    if (typeof window.saveCanvasState === 'function') {
        window.saveCanvasState();
    }
    
    // Reiniciar para um novo caminho
    points = [];
    currentPathPoints = [];
    currentPath = null;
    isDrawing = false;
    
    // Apresentar notificação de sucesso
    showNotification('Caminho criado com sucesso!', 'success');
}

/**
 * Cancela o caminho atual
 */
function cancelPath() {
    // Limpar temporários
    clearTemporaryElements();
    
    // Reiniciar para um novo caminho
    points = [];
    currentPathPoints = [];
    currentPath = null;
    isDrawing = false;
    
    // Renderizar canvas
    window.canvas.requestRenderAll();
}

/**
 * Limpa os elementos temporários
 */
function clearTemporaryElements() {
    // Remover caminho atual
    if (currentPath) {
        window.canvas.remove(currentPath);
        currentPath = null;
    }
    
    // Remover pontos de controle
    window.canvas.getObjects().forEach(obj => {
        if (obj.name === 'control-point' || obj.name === 'bezier-control' || obj.name === 'bezier-line') {
            window.canvas.remove(obj);
        }
    });
}

/**
 * Exibe uma notificação ao usuário
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Verificar se já existe um container de notificações
    let notificationContainer = document.getElementById('canvas-notifications');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'canvas-notifications';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.bottom = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
        document.body.appendChild(notificationContainer);
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    notification.style.backgroundColor = type === 'success' ? '#d4edda' : 
                                         type === 'error' ? '#f8d7da' : 
                                         type === 'warning' ? '#fff3cd' : '#d1ecf1';
    notification.style.color = type === 'success' ? '#155724' : 
                               type === 'error' ? '#721c24' : 
                               type === 'warning' ? '#856404' : '#0c5460';
    notification.style.padding = '10px 15px';
    notification.style.margin = '5px 0';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    notification.style.transition = 'all 0.3s ease';
    
    // Adicionar notificação ao container
    notificationContainer.appendChild(notification);
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 