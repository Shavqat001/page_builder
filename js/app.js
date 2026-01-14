document.addEventListener('DOMContentLoaded', () => {
    if (typeof loadFromLocalStorage === 'function') {
        loadFromLocalStorage();
    }
    if (typeof initKeyboardNavigation === 'function') {
        initKeyboardNavigation();
    }
    renderPreview();
    if (typeof getSelectedElement === 'function' && getSelectedElement()) {
        renderProperties();
    }
    updateCode();

    document.addEventListener('click', (e) => {
        const suggestionsDiv = document.getElementById('style-suggestions');
        const keyInput = document.getElementById('new-style-key');
        if (suggestionsDiv && keyInput && 
            !suggestionsDiv.contains(e.target) && 
            e.target !== keyInput) {
            suggestionsDiv.style.display = 'none';
        }
    });
});
