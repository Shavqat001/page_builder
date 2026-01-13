// Генерация HTML и CSS кода

function updateCode() {
    const elements = getElements();
    let html = '';
    let css = '';
    const classStyles = {};

    // Функция для сбора всех стилей из элемента и его дочерних элементов
    function collectStyles(el) {
        // Собираем стили для классов текущего элемента
        if (el.classes.length > 0 && Object.keys(el.styles).length > 0) {
            el.classes.forEach(cls => {
                if (!classStyles[cls]) {
                    classStyles[cls] = {};
                }
                Object.assign(classStyles[cls], el.styles);
            });
        }
        
        // Рекурсивно обрабатываем дочерние элементы
        if (el.children && el.children.length > 0) {
            el.children.forEach(child => {
                collectStyles(child);
            });
        }
    }

    function generateElementHTML(el, indent = 4) {
        const indentStr = ' '.repeat(indent);
        let attrs = '';
        if (el.classes.length > 0) {
            attrs += ` class="${el.classes.join(' ')}"`;
        }
        Object.keys(el.attributes).forEach(key => {
            attrs += ` ${key}="${el.attributes[key]}"`;
        });

        const voidElements = ['img', 'input', 'br', 'hr'];
        const textOnlyElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'label', 'button'];
        
        // Генерируем HTML с учетом дочерних элементов
        if (voidElements.includes(el.tag)) {
            return `${indentStr}<${el.tag}${attrs}>\n`;
        } else if (el.tag === 'textarea') {
            return `${indentStr}<${el.tag}${attrs}></${el.tag}>\n`;
        } else if (el.children && el.children.length > 0) {
            // Элемент имеет дочерние элементы
            let result = `${indentStr}<${el.tag}${attrs}>\n`;
            el.children.forEach(child => {
                result += generateElementHTML(child, indent + 4);
            });
            result += `${indentStr}</${el.tag}>\n`;
            return result;
        } else if (el.tag === 'ul' || el.tag === 'ol') {
            let result = `${indentStr}<${el.tag}${attrs}>\n`;
            result += `${' '.repeat(indent + 4)}<li>Элемент списка</li>\n`;
            result += `${indentStr}</${el.tag}>\n`;
            return result;
        } else {
            return `${indentStr}<${el.tag}${attrs}>${el.text}</${el.tag}>\n`;
        }
    }

    // Собираем стили из всех элементов (включая вложенные)
    elements.forEach(el => {
        collectStyles(el);
    });

    elements.forEach(el => {
        html += generateElementHTML(el);
    });

    // Генерируем CSS
    Object.keys(classStyles).forEach(cls => {
        const styles = classStyles[cls];
        const styleStr = Object.keys(styles).map(key =>
            `  ${key}: ${styles[key]};`
        ).join('\n');
        css += `.${cls} {\n${styleStr}\n}\n\n`;
    });

    // Если есть inline стили, добавляем их как классы (рекурсивно)
    function addInlineStyles(el) {
        if (Object.keys(el.styles).length > 0 && el.classes.length === 0) {
            const styleId = `style-${el.id}`;
            const styleStr = Object.keys(el.styles).map(key =>
                `  ${key}: ${el.styles[key]};`
            ).join('\n');
            css += `.${styleId} {\n${styleStr}\n}\n\n`;
            // Обновляем HTML с классом
            html = html.replace(`<${el.tag}`, `<${el.tag} class="${styleId}"`);
        }
        if (el.children && el.children.length > 0) {
            el.children.forEach(child => {
                addInlineStyles(child);
            });
        }
    }
    
    elements.forEach(el => {
        addInlineStyles(el);
    });

    const fullCode = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Сгенерированная страница</title>
    <style>
${css.trim() || '        /* Добавьте свои стили */'}
    </style>
</head>
<body>
${html.trim() || '    <!-- Добавьте элементы -->'}
</body>
</html>`;

    document.getElementById('codeOutput').value = fullCode;
}
