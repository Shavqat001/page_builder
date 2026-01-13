// Управление элементами: создание, редактирование, удаление

let elements = [];
let selectedElement = null;
let elementCounter = 0;

function getDefaultText(tag) {
    const defaults = {
        'h1': 'Заголовок 1',
        'h2': 'Заголовок 2',
        'h3': 'Заголовок 3',
        'p': 'Текст параграфа',
        'button': 'Кнопка',
        'a': 'Ссылка',
        'span': 'Текст',
        'li': 'Элемент списка',
        'label': 'Метка',
        'ul': '',
        'ol': '',
        'img': ''
    };
    return defaults[tag] || `Элемент ${tag}`;
}

function addElement(tag) {
    const element = {
        id: `el-${elementCounter++}`,
        tag: tag,
        text: getDefaultText(tag),
        classes: [],
        styles: {},
        attributes: {}
    };

    // Специальные атрибуты для некоторых элементов
    if (tag === 'img') {
        element.attributes.src = 'wot.jpg';
        element.attributes.alt = 'Изображение';
    } else if (tag === 'a') {
        element.attributes.href = '#';
    } else if (tag === 'input') {
        element.attributes.type = 'text';
        element.attributes.placeholder = 'Введите текст';
    }

    elements.push(element);
    renderPreview();
    selectElement(element);
    updateCode();
}

function renderPreview() {
    const preview = document.getElementById('preview');

    if (elements.length === 0) {
        preview.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/>
                </svg>
                <p>Добавьте элементы из боковой панели</p>
            </div>
        `;
        return;
    }

    preview.innerHTML = '';
    elements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.dataset.id = el.id;
        if (selectedElement && selectedElement.id === el.id) {
            div.classList.add('selected');
        }

        div.onclick = (e) => {
            e.stopPropagation();
            selectElement(el);
        };

        // Создаем реальный элемент
        const realEl = document.createElement(el.tag);

        // Добавляем классы
        if (el.classes.length > 0) {
            realEl.className = el.classes.join(' ');
        }

        // Добавляем стили
        Object.keys(el.styles).forEach(key => {
            realEl.style[key] = el.styles[key];
        });

        // Добавляем атрибуты
        Object.keys(el.attributes).forEach(key => {
            realEl.setAttribute(key, el.attributes[key]);
        });

        // Добавляем текст (если не img, input и т.д.)
        if (!['img', 'input', 'textarea'].includes(el.tag)) {
            if (el.tag === 'ul' || el.tag === 'ol') {
                const li = document.createElement('li');
                li.textContent = 'Элемент списка';
                realEl.appendChild(li);
            } else {
                realEl.textContent = el.text;
            }
        } else if (el.tag === 'input' || el.tag === 'textarea') {
            if (el.attributes.placeholder) {
                realEl.placeholder = el.attributes.placeholder;
            }
            if (el.attributes.value) {
                realEl.value = el.attributes.value;
            }
        }

        div.appendChild(realEl);
        preview.appendChild(div);
    });
}

function selectElement(element) {
    selectedElement = element;
    renderPreview();
    renderProperties();
}

function renderProperties() {
    if (!selectedElement) {
        document.getElementById('properties').innerHTML =
            '<p style="color: #94a3b8; font-size: 14px;">Выберите элемент для редактирования</p>';
        return;
    }

    const el = selectedElement;
    const props = document.getElementById('properties');

    props.innerHTML = `
        <div class="form-group">
            <label>Тег: <span class="tag-badge">${el.tag}</span></label>
        </div>

        <div class="form-group">
            <label>Текст содержимого:</label>
            <textarea id="prop-text" onchange="updateProperty('text', this.value)">${el.text || ''}</textarea>
        </div>

        <div class="form-group">
            <label>Классы CSS:</label>
            <div class="class-list" id="class-list">
                ${el.classes.map((cls, idx) => `
                    <div class="class-item">
                        <span>${cls}</span>
                        <span class="remove" onclick="removeClass(${idx})">×</span>
                    </div>
                `).join('')}
            </div>
            <div class="add-class-input">
                <input type="text" id="new-class" placeholder="Название класса">
                <button onclick="addClass()">Добавить</button>
            </div>
        </div>

        <div class="form-group">
            <label>Стили CSS:</label>
            <div id="styles-list">
                ${Object.keys(el.styles).map((key, idx) => `
                    <div class="style-line">
                        <input type="text" value="${key}" placeholder="Свойство" 
                            onchange="updateStyleKey(${idx}, this.value)">
                        <input type="text" value="${el.styles[key]}" placeholder="Значение"
                            onchange="updateStyleValue('${key}', this.value)">
                        ${key.includes('color') ? `<input type="color" value="${rgbToHex(el.styles[key])}" onchange="updateStyleValue('${key}', this.value)">` : ''}
                        <button onclick="removeStyle('${key}')">×</button>
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
                <input type="text" id="new-style-key" placeholder="Свойство (например: margin)">
                <input type="text" id="new-style-value" placeholder="Значение (например: 20px)">
            </div>
            <button class="add-style-btn" onclick="addStyle()">+ Добавить стиль</button>
        </div>

        ${el.tag === 'img' ? `
            <div class="form-group">
                <label>Источник изображения:</label>
                <input type="text" value="${el.attributes.src || ''}" 
                    onchange="updateAttribute('src', this.value)" placeholder="wot.jpg">
            </div>
            <div class="form-group">
                <label>Alt текст:</label>
                <input type="text" value="${el.attributes.alt || ''}" 
                    onchange="updateAttribute('alt', this.value)">
            </div>
        ` : ''}

        ${el.tag === 'a' ? `
            <div class="form-group">
                <label>URL ссылки:</label>
                <input type="text" value="${el.attributes.href || ''}" 
                    onchange="updateAttribute('href', this.value)">
            </div>
        ` : ''}

        ${['input', 'textarea'].includes(el.tag) ? `
            <div class="form-group">
                <label>Placeholder:</label>
                <input type="text" value="${el.attributes.placeholder || ''}" 
                    onchange="updateAttribute('placeholder', this.value)">
            </div>
        ` : ''}

        <button class="btn btn-danger" onclick="deleteElement()">Удалить элемент</button>
    `;
}

function updateProperty(prop, value) {
    if (!selectedElement) return;
    selectedElement[prop] = value;
    renderPreview();
    updateCode();
}

function addClass() {
    const input = document.getElementById('new-class');
    const className = input.value.trim();
    if (className && !selectedElement.classes.includes(className)) {
        selectedElement.classes.push(className);
        input.value = '';
        renderProperties();
        renderPreview();
        updateCode();
    }
}

function removeClass(index) {
    selectedElement.classes.splice(index, 1);
    renderProperties();
    renderPreview();
    updateCode();
}

function addStyle() {
    const key = document.getElementById('new-style-key').value.trim();
    const value = document.getElementById('new-style-value').value.trim();
    if (key && value) {
        selectedElement.styles[key] = value;
        document.getElementById('new-style-key').value = '';
        document.getElementById('new-style-value').value = '';
        renderProperties();
        renderPreview();
        updateCode();
    }
}

function updateStyleKey(oldIndex, newKey) {
    const oldKey = Object.keys(selectedElement.styles)[oldIndex];
    const value = selectedElement.styles[oldKey];
    delete selectedElement.styles[oldKey];
    selectedElement.styles[newKey] = value;
    renderProperties();
    renderPreview();
    updateCode();
}

function updateStyleValue(key, value) {
    selectedElement.styles[key] = value;
    renderPreview();
    updateCode();
}

function removeStyle(key) {
    delete selectedElement.styles[key];
    renderProperties();
    renderPreview();
    updateCode();
}

function updateAttribute(key, value) {
    selectedElement.attributes[key] = value;
    renderPreview();
    updateCode();
}

function deleteElement() {
    if (!selectedElement) return;
    elements = elements.filter(el => el.id !== selectedElement.id);
    selectedElement = null;
    renderPreview();
    renderProperties();
    updateCode();
}

function clearAll() {
    if (confirm('Удалить все элементы?')) {
        elements = [];
        selectedElement = null;
        renderPreview();
        renderProperties();
        updateCode();
    }
}

// Экспорт для использования в других модулях
function getElements() {
    return elements;
}

function getSelectedElement() {
    return selectedElement;
}
