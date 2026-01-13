// Drag and Drop функциональность

let draggedTag = null; // Тег, перетаскиваемый из sidebar
let draggedElement = null; // Элемент, перетаскиваемый внутри preview
let draggedElementData = null;
let dropIndicator = null;

function initDragAndDrop() {
    // Создаем индикатор drop-зоны
    dropIndicator = document.createElement('div');
    dropIndicator.className = 'drop-indicator';
    dropIndicator.style.display = 'none';
    document.getElementById('preview').appendChild(dropIndicator);
    
    // Делаем все кнопки в sidebar перетаскиваемыми
    const sidebar = document.querySelector('.sidebar');
    const buttons = sidebar.querySelectorAll('.btn[onclick*="addElement"]');
    
    buttons.forEach(btn => {
        btn.draggable = true;
        const tag = btn.getAttribute('onclick').match(/addElement\('(\w+)'\)/)?.[1];
        if (tag) {
            btn.dataset.tag = tag;
            
            btn.addEventListener('dragstart', (e) => {
                draggedTag = tag;
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('text/plain', tag);
                btn.style.opacity = '0.5';
            });
            
            btn.addEventListener('dragend', (e) => {
                btn.style.opacity = '1';
                draggedTag = null;
            });
        }
    });
    
    // Делаем preview droppable для элементов из sidebar
    const preview = document.getElementById('preview');
    
    // Добавляем обработчик клика на пустую область для деселекта
    preview.addEventListener('click', (e) => {
        // Если клик был не на элементе preview-item, деселектим все
        if (!e.target.closest('.preview-item')) {
            if (typeof deselectAll === 'function') {
                deselectAll();
            }
        }
    });
    
    preview.addEventListener('dragover', (e) => {
        if (draggedTag) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // Показываем индикатор в конце списка
            const rect = preview.getBoundingClientRect();
            const scrollTop = preview.scrollTop;
            const scrollHeight = preview.scrollHeight;
            
            dropIndicator.style.display = 'block';
            dropIndicator.style.width = (rect.width - 40) + 'px';
            dropIndicator.style.top = (scrollHeight - scrollTop - 2) + 'px';
            dropIndicator.style.left = '20px';
        } else if (draggedElement) {
            // Перетаскивание элемента внутри preview
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const rect = preview.getBoundingClientRect();
            const mouseY = e.clientY - rect.top + preview.scrollTop;
            const mouseX = e.clientX - rect.left;
            
            // Находим элемент под курсором (включая вложенные на всех уровнях)
            const allPreviewItems = Array.from(preview.querySelectorAll('.preview-item'));
            let targetItem = null;
            let targetElementData = null;
            let closestDistance = Infinity;
            
            allPreviewItems.forEach((item) => {
                if (item === draggedElement || item.contains(draggedElement)) return;
                
                const itemRect = item.getBoundingClientRect();
                const itemTop = itemRect.top - rect.top + preview.scrollTop;
                const itemBottom = itemTop + itemRect.height;
                const itemLeft = itemRect.left - rect.left;
                const itemRight = itemLeft + itemRect.width;
                
                // Проверяем, находится ли курсор внутри элемента
                if (mouseY >= itemTop && mouseY <= itemBottom && mouseX >= itemLeft && mouseX <= itemRight) {
                    // Выбираем самый маленький элемент (самый вложенный), который содержит курсор
                    const itemArea = itemRect.width * itemRect.height;
                    if (itemArea < closestDistance) {
                        closestDistance = itemArea;
                        targetItem = item;
                        const targetId = item.dataset.elementId;
                        const elements = getElements();
                        targetElementData = findElementById(elements, targetId);
                    }
                }
            });
            
            if (targetItem && targetItem !== draggedElement && targetElementData) {
                const targetRect = targetItem.getBoundingClientRect();
                const elementCenterY = targetRect.top + targetRect.height / 2 - rect.top + preview.scrollTop;
                
                // Проверяем, может ли целевой элемент содержать другие
                let canContain = false;
                try {
                    canContain = canContainChildren(targetElementData.tag);
                } catch(e) {
                    const voidElements = ['img', 'input', 'textarea', 'br', 'hr', 'meta', 'link'];
                    const textOnlyElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'label', 'button'];
                    canContain = !voidElements.includes(targetElementData.tag) && !textOnlyElements.includes(targetElementData.tag);
                }
                
                // Проверяем, не пытаемся ли переместить элемент внутрь самого себя
                const isSelfOrDescendant = isDescendant(draggedElementData, targetElementData);
                
                dropIndicator.style.display = 'block';
                
                if (mouseY < elementCenterY) {
                    // Показываем сверху (вставка перед элементом)
                    dropIndicator.style.top = (targetRect.top - rect.top + preview.scrollTop - 2) + 'px';
                    dropIndicator.style.left = (targetRect.left - rect.left + 8) + 'px';
                    dropIndicator.style.width = (targetRect.width - 16) + 'px';
                    dropIndicator.style.background = '#3b82f6';
                } else if (canContain && !isSelfOrDescendant) {
                    // Показываем снизу с отступом (вставка внутрь)
                    dropIndicator.style.top = (targetRect.bottom - rect.top + preview.scrollTop - 8) + 'px';
                    dropIndicator.style.left = (targetRect.left - rect.left + 28) + 'px';
                    dropIndicator.style.width = (targetRect.width - 56) + 'px';
                    dropIndicator.style.background = '#10b981';
                } else {
                    // Показываем снизу (вставка после элемента)
                    dropIndicator.style.top = (targetRect.bottom - rect.top + preview.scrollTop - 2) + 'px';
                    dropIndicator.style.left = (targetRect.left - rect.left + 8) + 'px';
                    dropIndicator.style.width = (targetRect.width - 16) + 'px';
                    dropIndicator.style.background = '#3b82f6';
                }
            } else {
                // Показываем в конце (перемещение на верхний уровень)
                dropIndicator.style.display = 'block';
                dropIndicator.style.width = (rect.width - 40) + 'px';
                dropIndicator.style.top = (preview.scrollHeight - preview.scrollTop - 2) + 'px';
                dropIndicator.style.left = '20px';
                dropIndicator.style.background = '#3b82f6';
            }
        }
    });
    
    preview.addEventListener('dragleave', (e) => {
        if (!preview.contains(e.relatedTarget)) {
            hideDropIndicator();
        }
    });
    
    preview.addEventListener('drop', (e) => {
        e.preventDefault();
        hideDropIndicator();
        
        if (draggedTag) {
            // Добавляем новый элемент из sidebar
            addElement(draggedTag);
            draggedTag = null;
        } else if (draggedElement && draggedElementData) {
            // Перемещаем элемент внутри preview
            const rect = preview.getBoundingClientRect();
            const mouseY = e.clientY - rect.top + preview.scrollTop;
            const mouseX = e.clientX - rect.left;
            
            // Находим элемент под курсором (включая вложенные на всех уровнях)
            const allPreviewItems = Array.from(preview.querySelectorAll('.preview-item'));
            let targetItem = null;
            let targetElementData = null;
            let closestDistance = Infinity;
            
            allPreviewItems.forEach((item) => {
                if (item === draggedElement || item.contains(draggedElement)) return;
                
                const itemRect = item.getBoundingClientRect();
                const itemTop = itemRect.top - rect.top + preview.scrollTop;
                const itemBottom = itemTop + itemRect.height;
                const itemLeft = itemRect.left - rect.left;
                const itemRight = itemLeft + itemRect.width;
                
                // Проверяем, находится ли курсор внутри элемента
                if (mouseY >= itemTop && mouseY <= itemBottom && mouseX >= itemLeft && mouseX <= itemRight) {
                    // Выбираем самый маленький элемент (самый вложенный), который содержит курсор
                    const itemArea = itemRect.width * itemRect.height;
                    if (itemArea < closestDistance) {
                        closestDistance = itemArea;
                        targetItem = item;
                        const targetId = item.dataset.elementId;
                        const elements = getElements();
                        targetElementData = findElementById(elements, targetId);
                    }
                }
            });
            
            if (targetItem && targetElementData) {
                const targetRect = targetItem.getBoundingClientRect();
                const elementCenterY = targetRect.top + targetRect.height / 2 - rect.top + preview.scrollTop;
                
                // Проверяем, может ли целевой элемент содержать другие
                const canContain = canContainChildren(targetElementData.tag);
                
                // Проверяем, не пытаемся ли переместить элемент внутрь самого себя
                const isSelfOrDescendant = isDescendant(draggedElementData, targetElementData);
                
                if (mouseY > elementCenterY && canContain && !isSelfOrDescendant) {
                    // Вставляем внутрь элемента
                    moveElementInto(draggedElementData, targetElementData);
                } else {
                    // Вставляем рядом с элементом
                    moveElementNextTo(draggedElementData, targetElementData, mouseY < elementCenterY);
                }
            } else {
                // Вставляем в конец (перемещение на верхний уровень)
                removeElementFromStructure(draggedElementData);
                const elements = getElements();
                elements.push(draggedElementData);
            }
            
            renderPreview();
            updateCode();
            
            draggedElement = null;
            draggedElementData = null;
        }
    });
}

function makeElementDraggable(elementDiv, elementData) {
    elementDiv.draggable = true;
    elementDiv.dataset.elementId = elementData.id;
    
    elementDiv.addEventListener('dragstart', (e) => {
        draggedElement = elementDiv;
        draggedElementData = elementData;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', elementDiv.innerHTML);
        elementDiv.style.opacity = '0.5';
    });
    
    elementDiv.addEventListener('dragend', (e) => {
        elementDiv.style.opacity = '1';
        hideDropIndicator();
        draggedElement = null;
        draggedElementData = null;
    });
}

function hideDropIndicator() {
    if (dropIndicator) {
        dropIndicator.style.display = 'none';
    }
}

// Вспомогательные функции для работы с вложенностью
function findElementById(elements, id) {
    for (let el of elements) {
        if (el.id === id) return el;
        if (el.children) {
            const found = findElementById(el.children, id);
            if (found) return found;
        }
    }
    return null;
}

function isDescendant(parent, child) {
    if (parent.id === child.id) return true;
    if (!parent.children) return false;
    return parent.children.some(c => c.id === child.id || isDescendant(c, child));
}

// Перемещает элемент внутрь другого элемента
function moveElementInto(sourceElement, targetElement) {
    // Удаляем элемент из текущего места
    removeElementFromStructure(sourceElement);
    
    // Добавляем в новый родитель
    if (!targetElement.children) {
        targetElement.children = [];
    }
    targetElement.children.push(sourceElement);
}

// Перемещает элемент рядом с другим элементом
function moveElementNextTo(sourceElement, targetElement, before = false) {
    // Удаляем элемент из текущего места
    removeElementFromStructure(sourceElement);
    
    // Находим родителя целевого элемента (может быть на любом уровне вложенности)
    const parent = findParentElement(targetElement);
    
    if (parent) {
        // Перемещаем в массиве children родителя
        const children = parent.children || [];
        const targetIndex = children.findIndex(el => el.id === targetElement.id);
        
        if (targetIndex !== -1) {
            if (before) {
                children.splice(targetIndex, 0, sourceElement);
            } else {
                children.splice(targetIndex + 1, 0, sourceElement);
            }
        } else {
            children.push(sourceElement);
        }
    } else {
        // Перемещаем в основном массиве (верхний уровень)
        const elements = getElements();
        const targetIndex = elements.findIndex(el => el.id === targetElement.id);
        
        if (targetIndex !== -1) {
            if (before) {
                elements.splice(targetIndex, 0, sourceElement);
            } else {
                elements.splice(targetIndex + 1, 0, sourceElement);
            }
        } else {
            elements.push(sourceElement);
        }
    }
}

// Удаляет элемент из текущей структуры
function removeElementFromStructure(element) {
    const elements = getElements();
    
    // Удаляем из основного массива
    const index = elements.findIndex(el => el.id === element.id);
    if (index !== -1) {
        elements.splice(index, 1);
        return;
    }
    
    // Ищем и удаляем из children всех элементов
    function removeFromChildren(parent) {
        if (!parent.children) return false;
        const childIndex = parent.children.findIndex(child => child.id === element.id);
        if (childIndex !== -1) {
            parent.children.splice(childIndex, 1);
            return true;
        }
        for (let child of parent.children) {
            if (removeFromChildren(child)) return true;
        }
        return false;
    }
    
    for (let el of elements) {
        if (removeFromChildren(el)) return;
    }
}

// Находит родительский элемент для данного элемента
function findParentElement(element) {
    const elements = getElements();
    
    function findParent(parent, target) {
        if (!parent.children) return null;
        if (parent.children.some(child => child.id === target.id)) {
            return parent;
        }
        for (let child of parent.children) {
            const found = findParent(child, target);
            if (found) return found;
        }
        return null;
    }
    
    for (let el of elements) {
        const parent = findParent(el, element);
        if (parent) return parent;
    }
    return null;
}
