document.addEventListener('DOMContentLoaded', () => {
    if (typeof initKeyboardNavigation === 'function') {
        initKeyboardNavigation();
    }
    renderPreview();
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
