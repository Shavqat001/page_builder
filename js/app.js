// Точка входа приложения

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initDragAndDrop === 'function') {
        initDragAndDrop();
    }
    updateCode();
});
