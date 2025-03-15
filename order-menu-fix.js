/**
 * order-menu-fix.js - Implementação de menu dropdown para ordenação de objetos
 * Este script agrupa os botões de ordenação (frente, trás, topo, fundo) em um menu dropdown
 * Autor: Claude 3.7 Sonnet
 * Data: Criado em resposta às necessidades do usuário
 */

// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que o canvas e outros elementos sejam carregados
    setTimeout(function() {
        // Inicializar o menu de ordenação
        initOrderMenu();
        console.log("✅ Menu de ordenação inicializado!");
    }, 1000); // Aguardar 1 segundo após o DOM ser carregado
});

/**
 * Inicializa o menu dropdown de ordenação
 * Substitui os botões individuais por um menu dropdown com todas as opções
 */
function initOrderMenu() {
    try {
        console.log("Iniciando configuração do menu de ordenação...");
        
        // Verificar se o objeto canvas está disponível
        if (typeof canvas === 'undefined') {
            console.error("Objeto canvas não encontrado!");
            return;
        }
        
        // Buscar os botões existentes de ordenação
        const bringForwardButton = document.getElementById('bringForwardButton');
        const sendBackwardButton = document.getElementById('sendBackwardButton');
        const bringToFrontButton = document.getElementById('bringToFrontButton');
        const sendToBackButton = document.getElementById('sendToBackButton');
        
        // Verificar se os botões existem
        if (!bringForwardButton || !sendBackwardButton || !bringToFrontButton || !sendToBackButton) {
            console.error("Botões de ordenação não encontrados!");
            return;
        }
        
        // Criar o HTML para o menu dropdown
        const orderMenuHTML = `
            <div class="order-menu-container" style="position: relative; display: inline-block;">
                <button id="orderButton" class="editor-button" title="Ordenar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="4" y="5" width="16" height="3" rx="1"></rect>
                        <rect x="4" y="12" width="16" height="3" rx="1"></rect>
                        <rect x="4" y="19" width="16" height="3" rx="1"></rect>
                    </svg>
                    Ordenar
                </button>
                <div id="orderDropdown" class="order-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background-color: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); z-index: 1000; min-width: 150px;">
                    <div class="order-dropdown-item" id="bringForwardItem" title="Mover uma camada para frente">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        Mover para frente
                    </div>
                    <div class="order-dropdown-item" id="sendBackwardItem" title="Mover uma camada para trás">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                        Mover para trás
                    </div>
                    <div class="order-dropdown-item" id="bringToFrontItem" title="Mover para o topo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="17 11 12 6 7 11"></polyline>
                            <polyline points="17 18 12 13 7 18"></polyline>
                        </svg>
                        Mover para o topo
                    </div>
                    <div class="order-dropdown-item" id="sendToBackItem" title="Mover para o fundo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="7 7 12 12 17 7"></polyline>
                            <polyline points="7 14 12 19 17 14"></polyline>
                        </svg>
                        Mover para o fundo
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar o CSS para o menu dropdown
        const orderMenuCSS = `
            <style>
                .order-dropdown-item {
                    padding: 8px 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .order-dropdown-item:hover {
                    background-color: #f0f8ff;
                }
                .order-dropdown-item svg {
                    flex-shrink: 0;
                }
            </style>
        `;
        
        // Adicionar o CSS ao head
        document.head.insertAdjacentHTML('beforeend', orderMenuCSS);
        
        // Encontrar o contêiner onde estão os botões de ordenação
        const container = bringForwardButton.parentElement;
        
        // Ocultar os botões originais
        bringForwardButton.style.display = 'none';
        sendBackwardButton.style.display = 'none';
        bringToFrontButton.style.display = 'none';
        sendToBackButton.style.display = 'none';
        
        // Encontrar o botão de imagem e o botão de excluir para posicionar o menu de ordenação entre eles
        const imageButton = document.getElementById('imageButton');
        const deleteButton = document.getElementById('deleteButton');
        
        if (imageButton && deleteButton) {
            // Criar o elemento do menu de ordenação
            const orderMenuElement = document.createElement('div');
            orderMenuElement.innerHTML = orderMenuHTML;
            
            // Inserir o menu de ordenação após o botão de imagem
            deleteButton.parentNode.insertBefore(orderMenuElement.firstElementChild, deleteButton);
        } else {
            // Fallback: inserir no container original se os botões não forem encontrados
            container.insertAdjacentHTML('beforeend', orderMenuHTML);
            console.log("Botões 'Imagem' ou 'Excluir' não encontrados, usando posição padrão.");
        }
        
        // Configurar event listeners
        const orderButton = document.getElementById('orderButton');
        const orderDropdown = document.getElementById('orderDropdown');
        
        // Configurar event listener para o botão de ordenação
        orderButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Verificar se há um objeto selecionado
            const activeObject = canvas.getActiveObject();
            if (!activeObject) {
                showNotification("Selecione um objeto primeiro!");
                return;
            }
            
            // Alternar visibilidade do dropdown
            const isVisible = orderDropdown.style.display === 'block';
            orderDropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        // Configurar event listeners para os itens do dropdown
        document.getElementById('bringForwardItem').addEventListener('click', function() {
            bringForwardButton.click();
            orderDropdown.style.display = 'none';
            showNotification("Objeto movido para frente!");
        });
        
        document.getElementById('sendBackwardItem').addEventListener('click', function() {
            sendBackwardButton.click();
            orderDropdown.style.display = 'none';
            showNotification("Objeto movido para trás!");
        });
        
        document.getElementById('bringToFrontItem').addEventListener('click', function() {
            bringToFrontButton.click();
            orderDropdown.style.display = 'none';
            showNotification("Objeto movido para o topo!");
        });
        
        document.getElementById('sendToBackItem').addEventListener('click', function() {
            sendToBackButton.click();
            orderDropdown.style.display = 'none';
            showNotification("Objeto movido para o fundo!");
        });
        
        // Fechar o dropdown ao clicar fora dele
        document.addEventListener('click', function(e) {
            if (!orderButton.contains(e.target) && !orderDropdown.contains(e.target)) {
                orderDropdown.style.display = 'none';
            }
        });
        
        // Adicionar funcionalidade de verificação de seleção
        canvas.on('selection:created', updateOrderButtonState);
        canvas.on('selection:updated', updateOrderButtonState);
        canvas.on('selection:cleared', function() {
            orderButton.disabled = true;
            orderDropdown.style.display = 'none';
        });
        
        // Inicializar o estado do botão
        updateOrderButtonState();
        
        console.log("Menu de ordenação configurado com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar menu de ordenação:", error);
    }
}

/**
 * Atualiza o estado do botão de ordenação com base na seleção atual
 */
function updateOrderButtonState() {
    try {
        const orderButton = document.getElementById('orderButton');
        if (!orderButton) return;
        
        const activeObject = canvas.getActiveObject();
        orderButton.disabled = !activeObject;
    } catch (error) {
        console.error("Erro ao atualizar estado do botão de ordenação:", error);
    }
}

/**
 * Exibe uma notificação temporária para o usuário
 * @param {string} message - Mensagem a ser exibida
 */
function showNotification(message) {
    try {
        // Verificar se já existe uma notificação
        let notification = document.getElementById('canvas-notification');
        
        // Se não existir, criar uma nova
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'canvas-notification';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(notification);
        }
        
        // Atualizar a mensagem e mostrar a notificação
        notification.textContent = message;
        notification.style.opacity = "1";
        
        // Esconder após 2 segundos
        setTimeout(() => {
            notification.style.opacity = "0";
        }, 2000);
    } catch (error) {
        console.error("Erro ao exibir notificação:", error);
    }
}