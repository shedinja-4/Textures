document.querySelectorAll(".DropMenu").forEach(menu => {
    menu.addEventListener('click', () => {
        const contenedor = menu.parentElement;
        const barra = contenedor.querySelector('.ContenidoBut');
        barra.classList.toggle('hidden');
    });
});