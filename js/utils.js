// Утилиты для работы с цветами и копированием

function rgbToHex(rgb) {
    if (!rgb || rgb.startsWith('#')) return rgb || '#000000';
    const match = rgb.match(/\d+/g);
    if (!match) return '#000000';
    const [r, g, b] = match.map(Number);
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function copyCode() {
    const code = document.getElementById('codeOutput');
    code.select();
    code.setSelectionRange(0, 99999);
    document.execCommand('copy');

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Скопировано!';
    btn.style.background = '#10b981';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#10b981';
    }, 2000);
}
