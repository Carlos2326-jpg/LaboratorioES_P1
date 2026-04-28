// Carrega header e footer dinamicamente
export async function loadLayout() {
    try {
        const headerContainer = document.getElementById('header-container');
        const footerContainer = document.getElementById('footer-container');
        
        if (headerContainer) {
            const headerResponse = await fetch('/_shared/layouts/header.html');
            headerContainer.innerHTML = await headerResponse.text();
        }
        
        if (footerContainer) {
            const footerResponse = await fetch('/_shared/layouts/footer.html');
            footerContainer.innerHTML = await footerResponse.text();
        }
    } catch (error) {
        console.error('Erro ao carregar layout:', error);
    }
}