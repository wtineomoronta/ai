// Archivo de Lógica del Portal

// Define el contenedor donde se cargará el contenido de la vista (sin header/footer)
const CONTENT_AREA_ID = 'content-area';
const DEFAULT_VIEW = 'blog.html';

/**
 * Carga el contenido HTML de una vista específica en el contenedor principal.
 * @param {string} filePath - La ruta al archivo HTML a cargar (ej: 'blog.html', 'views/posts/post-prompts.html').
 * @param {boolean} pushState - Indica si se debe actualizar el historial del navegador.
 */
async function loadView(filePath, pushState = true) {
    const contentArea = document.getElementById(CONTENT_AREA_ID);
    if (!contentArea) {
        console.error("Error: Contenedor de contenido no encontrado.");
        return;
    }

    try {
        // Muestra un indicador de carga mientras se busca el contenido
        contentArea.innerHTML = '<div style="text-align:center; padding: 50px; font-size: 1.2rem; color: #007bff;">Cargando contenido...</div>';

        // 1. Fetch del contenido HTML
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la vista: ${filePath}`);
        }
        
        const html = await response.text();

        // 2. Extraer solo el contenido de la etiqueta <body> (o un contenedor específico)
        // Esto previene cargar etiquetas <html> o <head> anidadas.
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Asumimos que el contenido real de la vista está dentro de un div,
        // o si es un archivo de post, se carga completo.
        // Aquí simplificaremos, cargando todo el body. Si los archivos de post son 
        // solo el contenido, funcionará bien.
        
        // Para nuestros archivos (que solo contienen <section>), usamos el HTML completo.
        contentArea.innerHTML = html; 

        // 3. Gestionar el historial del navegador (para botones atrás/adelante)
        if (pushState) {
            // Reemplazamos el estado si es la carga inicial o si estamos navegando normalmente
            history.pushState({ path: filePath }, '', `?view=${encodeURIComponent(filePath)}`);
        }

        // 4. Scroll al inicio de la nueva vista
        window.scrollTo(0, 0);

        console.log(`Vista cargada exitosamente: ${filePath}`);

    } catch (error) {
        console.error("Error al cargar la vista:", error);
        contentArea.innerHTML = `<div style="text-align:center; padding: 50px; color: #dc3545;">Error al cargar el contenido. Por favor, intente de nuevo.</div>`;
    }
}

/**
 * Función para manejar la navegación desde los clics.
 * Reemplaza la antigua función alert().
 */
function showView(filepath, event) {
    if (event) event.preventDefault();
    loadView(filepath, true);
}


// Manejador del evento popstate (botones atrás/adelante del navegador)
window.onpopstate = (event) => {
    // Cuando el usuario usa los botones del navegador, popstate se dispara.
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('view') || DEFAULT_VIEW;
    
    // Cargamos la vista sin agregar un nuevo estado al historial (pushState = false)
    loadView(path, false); 
};

// Carga la vista por defecto o la vista especificada en la URL al cargar la página.
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('view') || DEFAULT_VIEW;
    
    // Cargamos la vista inicial, sin agregar estado (ya estamos en la URL correcta)
    loadView(path, false); 
});
