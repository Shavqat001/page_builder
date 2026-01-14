function initKeyboardNavigation() {
    const preview = document.getElementById('preview');

    preview.addEventListener('click', (e) => {

        if (!e.target.closest('.preview-item')) {
            if (typeof deselectAll === 'function') {
                deselectAll();
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        const selectedElement = getSelectedElement();
        if (!selectedElement) return;

        if (e.key === 'ArrowUp' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            moveElementUp(selectedElement);
        }

        if (e.key === 'ArrowDown' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            moveElementDown(selectedElement);
        }

        if (e.key === 'ArrowUp' && e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            moveElementIntoPrevious(selectedElement);
        }

        if (e.key === 'ArrowDown' && e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            moveElementOutOfContainer(selectedElement);
        }
    });
}

function moveElementUp(element) {
    const elements = getElements();
    const parent = findParentElement(element);
    if (parent) {

        const children = parent.children;
        const currentIndex = children.findIndex(el => el.id === element.id);
        if (currentIndex > 0) {

            [children[currentIndex], children[currentIndex - 1]] = [children[currentIndex - 1], children[currentIndex]];
            renderPreview();
            updateCode();

            selectElement(element);
        }
    } else {

        const currentIndex = elements.findIndex(el => el.id === element.id);
        if (currentIndex > 0) {

            [elements[currentIndex], elements[currentIndex - 1]] = [elements[currentIndex - 1], elements[currentIndex]];
            renderPreview();
            updateCode();

            selectElement(element);
        }
    }
}

function moveElementDown(element) {
    const elements = getElements();
    const parent = findParentElement(element);
    if (parent) {

        const children = parent.children;
        const currentIndex = children.findIndex(el => el.id === element.id);
        if (currentIndex < children.length - 1) {

            [children[currentIndex], children[currentIndex + 1]] = [children[currentIndex + 1], children[currentIndex]];
            renderPreview();
            updateCode();

            selectElement(element);
        }
    } else {

        const currentIndex = elements.findIndex(el => el.id === element.id);
        if (currentIndex < elements.length - 1) {

            [elements[currentIndex], elements[currentIndex + 1]] = [elements[currentIndex + 1], elements[currentIndex]];
            renderPreview();
            updateCode();

            selectElement(element);
        }
    }
}

function moveElementIntoPrevious(element) {
    const elements = getElements();
    const parent = findParentElement(element);
    if (parent) {

        const children = parent.children;
        const currentIndex = children.findIndex(el => el.id === element.id);
        if (currentIndex > 0) {
            const previousElement = children[currentIndex - 1];

            if (canContainChildren(previousElement.tag)) {

                children.splice(currentIndex, 1);

                if (!previousElement.children) {
                    previousElement.children = [];
                }
                previousElement.children.push(element);
                renderPreview();
                updateCode();

                selectElement(element);
                return true;
            } else {

                [children[currentIndex], children[currentIndex - 1]] = [children[currentIndex - 1], children[currentIndex]];
                renderPreview();
                updateCode();
                selectElement(element);
                return true;
            }
        } else {

            const grandParent = findParentElement(parent);
            if (grandParent) {
                const parentIndex = grandParent.children.findIndex(el => el.id === parent.id);
                if (parentIndex > 0) {
                    const previousSibling = grandParent.children[parentIndex - 1];
                    if (canContainChildren(previousSibling.tag)) {

                        children.splice(currentIndex, 1);

                        if (!previousSibling.children) {
                            previousSibling.children = [];
                        }
                        previousSibling.children.push(element);
                        renderPreview();
                        updateCode();
                        selectElement(element);
                        return true;
                    } else {

                        [grandParent.children[parentIndex], grandParent.children[parentIndex - 1]] = 
                            [grandParent.children[parentIndex - 1], grandParent.children[parentIndex]];
                        renderPreview();
                        updateCode();
                        selectElement(element);
                        return true;
                    }
                }
            }
        }
    } else {

        const currentIndex = elements.findIndex(el => el.id === element.id);
        if (currentIndex > 0) {
            const previousElement = elements[currentIndex - 1];

            if (canContainChildren(previousElement.tag)) {

                elements.splice(currentIndex, 1);

                if (!previousElement.children) {
                    previousElement.children = [];
                }
                previousElement.children.push(element);
                renderPreview();
                updateCode();

                selectElement(element);
                return true;
            } else {

                [elements[currentIndex], elements[currentIndex - 1]] = [elements[currentIndex - 1], elements[currentIndex]];
                renderPreview();
                updateCode();
                selectElement(element);
                return true;
            }
        }
    }
    return false;
}

function moveElementOutOfContainer(element) {
    const parent = findParentElement(element);
    if (!parent) {

        return;
    }

    const children = parent.children;
    const currentIndex = children.findIndex(el => el.id === element.id);
    if (currentIndex !== -1) {
        children.splice(currentIndex, 1);

        const grandParent = findParentElement(parent);
        const elements = getElements();
        if (grandParent) {

            const parentIndex = grandParent.children.findIndex(el => el.id === parent.id);
            if (parentIndex !== -1) {
                if (!grandParent.children) {
                    grandParent.children = [];
                }
                grandParent.children.splice(parentIndex + 1, 0, element);
            } else {
                grandParent.children.push(element);
            }
        } else {

            const parentIndex = elements.findIndex(el => el.id === parent.id);
            if (parentIndex !== -1) {
                elements.splice(parentIndex + 1, 0, element);
            } else {
                elements.push(element);
            }
        }
        renderPreview();
        updateCode();

        selectElement(element);
    }
}

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
