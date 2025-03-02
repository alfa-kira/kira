document.addEventListener('DOMContentLoaded', function() {
    const iconWrappers = document.querySelectorAll('.icon-wrapper');
    const workspacePanel = document.querySelector('.workspace-panel');
    let selectedComponents = [];
    let selectedComponent = null; // Adicionada definição da variável
    let isSelecting = false;
    let selectionBox = null;
    let startX, startY;
    let isDragging = false;
    let dragTarget = null;

    // Configurar ícones arrastáveis no painel lateral
    iconWrappers.forEach(wrapper => {
        wrapper.setAttribute('draggable', 'true');
        wrapper.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.innerHTML);
        });
    });

    // Permitir soltar ícones no workspace
    workspacePanel.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    // Processar o evento de soltar para criar novos componentes
    workspacePanel.addEventListener('drop', function(e) {
        e.preventDefault();
        const iconHtml = e.dataTransfer.getData('text/plain');
        
        const newIcon = document.createElement('div');
        newIcon.className = 'icon-wrapper workspace-icon';
        newIcon.innerHTML = iconHtml;
        
        // Altera a cor dos SVGs para azul escuro
        const svgElements = newIcon.querySelectorAll('svg *[stroke="#ffffff"]');
        svgElements.forEach(element => {
            element.setAttribute('stroke', '#1a237e');
        });
        
        const svgFillElements = newIcon.querySelectorAll('svg *[fill="#ffffff"]');
        svgFillElements.forEach(element => {
            if (element.getAttribute('fill') !== 'none') {
                element.setAttribute('fill', '#1a237e');
            }
        });
    
        newIcon.style.position = 'absolute';
        newIcon.style.left = (e.clientX - workspacePanel.getBoundingClientRect().left) + 'px';
        newIcon.style.top = (e.clientY - workspacePanel.getBoundingClientRect().top) + 'px';
        
        // Adiciona o novo ícone ao workspace
        workspacePanel.appendChild(newIcon);
        
        // Limpa seleções anteriores e seleciona o novo componente
        clearSelections();
        selectComponent(newIcon);
    });

    // Função para limpar todas as seleções
    function clearSelections() {
        document.querySelectorAll('.workspace-icon').forEach(icon => {
            icon.style.backgroundColor = 'transparent';
            icon.style.outline = 'none';
        });
        selectedComponents = [];
        selectedComponent = null;
    }
    
    // Função para selecionar um componente
    function selectComponent(component) {
        selectedComponent = component;
        component.style.backgroundColor = 'rgba(255, 193, 7, 0.3)';
        component.style.outline = '2px solid #ffc107';
        
        if (!selectedComponents.includes(component)) {
            selectedComponents.push(component);
        }
    }

    // Gerenciamento de eventos do mouse para os componentes no workspace
    workspacePanel.addEventListener('mousedown', function(e) {
        const target = e.target.closest('.workspace-icon');
        
        if (target) {
            // Clique em um componente
            e.stopPropagation();
            
            // Verifica se estamos clicando em um componente já selecionado
            const isAlreadySelected = selectedComponents.includes(target);
            
            // Se não estiver segurando a tecla Ctrl/Cmd, limpa seleções anteriores
            if (!e.ctrlKey && !e.metaKey) {
                if (!isAlreadySelected) {
                    clearSelections();
                }
            }
            
            // Se o componente não estava selecionado ou estamos segurando Ctrl/Cmd, seleciona-o
            if (!isAlreadySelected || e.ctrlKey || e.metaKey) {
                selectComponent(target);
            }
            
            // Começa a arrastar
            isDragging = true;
            dragTarget = target;
            const rect = target.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        } else if (e.target === workspacePanel) {
            // Clique no espaço vazio do workspace
            clearSelections();
            
            // Inicia seleção por área
            isSelecting = true;
            const rect = workspacePanel.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
    
            selectionBox = document.createElement('div');
            selectionBox.className = 'selection-box';
            selectionBox.style.left = startX + 'px';
            selectionBox.style.top = startY + 'px';
            workspacePanel.appendChild(selectionBox);
        }
    });
    
    // Movimentação do mouse
    document.addEventListener('mousemove', function(e) {
        // Lógica para arrastar componentes
        if (isDragging && selectedComponents.length > 0) {
            e.preventDefault();
            
            const workspaceRect = workspacePanel.getBoundingClientRect();
            const deltaX = e.clientX - workspaceRect.left - startX;
            const deltaY = e.clientY - workspaceRect.top - startY;
            
            // Se temos apenas um componente selecionado, usamos startX/startY diretamente
            if (selectedComponents.length === 1) {
                selectedComponents[0].style.left = `${deltaX}px`;
                selectedComponents[0].style.top = `${deltaY}px`;
            } 
            // Se temos múltiplos componentes, movemos todos juntos de forma relativa
            else if (dragTarget) {
                const originalRect = dragTarget.getBoundingClientRect();
                const originalLeft = parseFloat(dragTarget.style.left);
                const originalTop = parseFloat(dragTarget.style.top);
                
                const newLeft = deltaX;
                const newTop = deltaY;
                
                const diffX = newLeft - originalLeft;
                const diffY = newTop - originalTop;
                
                selectedComponents.forEach(component => {
                    const left = parseFloat(component.style.left) + diffX;
                    const top = parseFloat(component.style.top) + diffY;
                    
                    component.style.left = `${left}px`;
                    component.style.top = `${top}px`;
                });
            }
        }
        // Lógica para seleção por área
        else if (isSelecting && selectionBox) {
            const rect = workspacePanel.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
        
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
        
            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';
            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';
        
            // Seleciona ícones dentro da área
            document.querySelectorAll('.workspace-icon').forEach(icon => {
                const iconRect = icon.getBoundingClientRect();
                const isInside = (
                    iconRect.left >= rect.left + left &&
                    iconRect.right <= rect.left + left + width &&
                    iconRect.top >= rect.top + top &&
                    iconRect.bottom <= rect.top + top + height
                );
        
                if (isInside) {
                    icon.style.backgroundColor = 'rgba(255, 193, 7, 0.3)';
                    icon.style.outline = '2px solid #ffc107';
                    if (!selectedComponents.includes(icon)) {
                        selectedComponents.push(icon);
                    }
                } else {
                    icon.style.backgroundColor = 'transparent';
                    icon.style.outline = 'none';
                    const index = selectedComponents.indexOf(icon);
                    if (index > -1) {
                        selectedComponents.splice(index, 1);
                    }
                }
            });
        }
    });
    
    // Finalizar ações ao soltar o mouse
    document.addEventListener('mouseup', function() {
        isDragging = false;
        dragTarget = null;
        
        if (isSelecting) {
            isSelecting = false;
            if (selectionBox && selectionBox.parentNode) {
                selectionBox.remove();
            }
            selectionBox = null;
            
            // Atualiza o selectedComponent se tivermos apenas um item selecionado
            if (selectedComponents.length === 1) {
                selectedComponent = selectedComponents[0];
            } else {
                selectedComponent = null;
            }
        }
    });
    
    // Deletar componentes selecionados
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' && selectedComponents.length > 0) {
            selectedComponents.forEach(component => component.remove());
            selectedComponents = [];
            selectedComponent = null;
        }
    });
});
