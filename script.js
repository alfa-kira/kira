document.addEventListener('DOMContentLoaded', function() {
    const iconWrappers = document.querySelectorAll('.icon-wrapper');
    const workspacePanel = document.querySelector('.workspace-panel');
    let selectedComponents = [];
    let isSelecting = false;
    let selectionBox = null;
    let startX, startY;

    iconWrappers.forEach(wrapper => {
        wrapper.setAttribute('draggable', 'true');
        wrapper.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.innerHTML);
        });
    });

    workspacePanel.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

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
        
        let isDragging = false;
        let startX, startY;
    
        // Eventos de arrasto
        newIcon.addEventListener('mousedown', function(e) {
            isDragging = true;
            const rect = newIcon.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        });
    
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const x = e.clientX - workspacePanel.getBoundingClientRect().left - startX;
            const y = e.clientY - workspacePanel.getBoundingClientRect().top - startY;
            
            newIcon.style.left = `${x}px`;
            newIcon.style.top = `${y}px`;
        });
    
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    
        // Evento de clique para seleção
        newIcon.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            
            // Remove seleção anterior
            if (selectedComponent) {
                selectedComponent.style.backgroundColor = 'transparent';
                selectedComponent.style.outline = 'none';
            }
            
            // Seleciona novo componente
            selectedComponent = newIcon;
            newIcon.style.backgroundColor = 'rgba(255, 193, 7, 0.3)';
            newIcon.style.outline = '2px solid #ffc107';
        });
        
        workspacePanel.appendChild(newIcon);
    });

    // Clique no workspace para desselecionar
    workspacePanel.addEventListener('click', function(e) {
        if (e.target === workspacePanel && selectedComponent) {
            selectedComponent.style.backgroundColor = 'transparent';
            selectedComponent.style.outline = 'none';
            selectedComponent = null;
        }
    });

    // Tecla Delete para apagar componente selecionado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' && selectedComponent) {
            selectedComponent.remove();
            selectedComponent = null;
        }
    });
    // Adiciona eventos de seleção por área
    workspacePanel.addEventListener('mousedown', function(e) {
        if (e.target === workspacePanel) {
            isSelecting = true;
            const rect = workspacePanel.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
    
            selectionBox = document.createElement('div');
            selectionBox.className = 'selection-box';
            selectionBox.style.left = startX + 'px';
            selectionBox.style.top = startY + 'px';
            workspacePanel.appendChild(selectionBox);
    
            // Limpa seleções anteriores
            document.querySelectorAll('.workspace-icon').forEach(icon => {
                icon.style.backgroundColor = 'transparent';
                icon.style.outline = 'none';
            });
            selectedComponents = [];
        }
    });
    
    workspacePanel.addEventListener('mousemove', function(e) {
        if (!isSelecting || !selectionBox) return;
    
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
                if (!isDragging) {
                    icon.style.backgroundColor = 'transparent';
                    icon.style.outline = 'none';
                    const index = selectedComponents.indexOf(icon);
                    if (index > -1) {
                        selectedComponents.splice(index, 1);
                    }
                }
            }
        });
    });
    
    document.addEventListener('mouseup', function() {
        if (isSelecting) {
            isSelecting = false;
            if (selectionBox && selectionBox.parentNode) {
                selectionBox.remove();
            }
            selectionBox = null;
        }
    });
    // Atualiza o evento de delete para múltiplos componentes
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' && selectedComponents.length > 0) {
            selectedComponents.forEach(component => component.remove());
            selectedComponents = [];
        }
    });
});