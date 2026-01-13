// Генерация HTML и CSS кода

function updateCode() {
    const elements = getElements();
    let html = '';
    let css = '';
    const classStyles = {};

    elements.forEach(el => {
        // Собираем HTML
        let attrs = '';
        if (el.classes.length > 0) {
            attrs += ` class="${el.classes.join(' ')}"`;
        }
        Object.keys(el.attributes).forEach(key => {
            attrs += ` ${key}="${el.attributes[key]}"`;
        });

        // Собираем стили для классов
        if (el.classes.length > 0 && Object.keys(el.styles).length > 0) {
            el.classes.forEach(cls => {
                if (!classStyles[cls]) {
                    classStyles[cls] = {};
                }
                Object.assign(classStyles[cls], el.styles);
            });
        }

        // Генерируем HTML
        if (el.tag === 'img') {
            html += `    <img${attrs}>\n`;
        } else if (el.tag === 'input' || el.tag === 'textarea') {
            html += `    <${el.tag}${attrs}></${el.tag}>\n`;
        } else if (el.tag === 'ul' || el.tag === 'ol') {
            html += `    <${el.tag}${attrs}>\n        <li>Элемент списка</li>\n    </${el.tag}>\n`;
        } else {
            html += `    <${el.tag}${attrs}>${el.text}</${el.tag}>\n`;
        }
    });

    // Генерируем CSS
    Object.keys(classStyles).forEach(cls => {
        const styles = classStyles[cls];
        const styleStr = Object.keys(styles).map(key =>
            `  ${key}: ${styles[key]};`
        ).join('\n');
        css += `.${cls} {\n${styleStr}\n}\n\n`;
    });

    // Если есть inline стили, добавляем их как классы
    elements.forEach(el => {
        if (Object.keys(el.styles).length > 0 && el.classes.length === 0) {
            const styleId = `style-${el.id}`;
            const styleStr = Object.keys(el.styles).map(key =>
                `  ${key}: ${el.styles[key]};`
            ).join('\n');
            css += `.${styleId} {\n${styleStr}\n}\n\n`;
            // Обновляем HTML с классом
            html = html.replace(`<${el.tag}`, `<${el.tag} class="${styleId}"`);
        }
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
