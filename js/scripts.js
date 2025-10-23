document.addEventListener('DOMContentLoaded', () => {
    // 1. DEFINICIÓN DE VISTAS Y ELEMENTOS PRINCIPALES
    const views = {
        'inicio': 'views/inicio.html',
        'blog': 'views/blog.html',
        'sobremi': 'views/sobremi.html',
        'contacto': 'views/contacto.html',
        'post-prompts': 'views/posts/post-prompts.html',
        'post-rag': 'views/posts/post-rag.html',
        'post-vector-db': 'views/posts/post-vector-db.html',
        'post-infografia-datos-ip': 'views/posts/post-infografia-datos-ip.html',        
        'post-refuerzo': 'views/posts/post-refuerzo.html',
        'post-xai': 'views/posts/post-xai.html'
    };
    
    const mainContentArea = document.getElementById('main-content-area');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    // -------------------------------------------------------------------
    // 2. LÓGICA DEL MODAL (Dialog/Popup)
    // -------------------------------------------------------------------
    
    /**
     * Muestra el modal de estado con el mensaje proporcionado.
     */
    window.showModal = function(message, type = 'success') {
        // Buscamos los elementos del modal
        const modalOverlay = document.getElementById('status-modal'); 
        // Corregido: Buscamos el contenido dentro del overlay
        const modalContent = modalOverlay ? modalOverlay.querySelector('.modal-content') : null;
        const modalMessage = document.getElementById('status-modal-message');
        const modalIcon = document.getElementById('modal-icon'); 

        if (modalOverlay && modalContent && modalMessage && modalIcon) {
            modalMessage.textContent = message;
            
            // Limpiar clases de estilo (success/error) y aplicar el tipo
            modalContent.classList.remove('success', 'error'); // Las clases de color van en modal-content
            modalIcon.className = 'fas'; // Resetear clase de icono
            
            if (type === 'success') {
                modalContent.classList.add('success');
                modalIcon.classList.add('fa-check-circle');
                modalIcon.style.color = 'var(--color-primary)';
            } else if (type === 'error') {
                modalContent.classList.add('error');
                modalIcon.classList.add('fa-times-circle');
                modalIcon.style.color = '#dc3545';
            }
            
            // Mostrar modal (usando la clase 'open' en el overlay)
            modalOverlay.classList.add('open');
        } else {
            // Fallback: Si el modal no existe en el DOM (no estamos en la vista de contacto)
            console.warn("Modal no encontrado. No se puede mostrar el mensaje de confirmación.");
            console.log(`[Mensaje de Contacto] ${message}`);
        }
    }

    window.closeModal = function() {
        const modalOverlay = document.getElementById('status-modal'); 
        // Cerrar modal
        if (modalOverlay) {
            modalOverlay.classList.remove('open');
        }
    }

    // FUNCIÓN DE SIMULACIÓN DE ENVÍO
    window.handleContactFormSubmit = function(event) {
        // ESTA LÍNEA ES CRÍTICA: DETIENE EL ENVÍO HTTP Y PREVIENE EL ERROR 405
        event.preventDefault(); 

        const form = document.getElementById('contact-form');
        
        // Simulación: No se hace fetch ni se abre mailto.

        // 1. Mostrar el modal de éxito simulado
        window.showModal(
            '¡Mensaje Enviado con Éxito! Su consulta ha sido recibida y será respondida a la brevedad posible. Gracias por contactarme.', 
            'success'
        );
        
        // 2. Limpiar el formulario
        form.reset();

        return false; // Previene cualquier acción por defecto adicional
    }
    
    // -------------------------------------------------------------------
    // 3. LÓGICA DE NAVEGACIÓN (Router con Historial)
    // -------------------------------------------------------------------

    /**
     * Carga la vista especificada en el área de contenido principal.
     */
    async function loadViewContent(viewId, pushState = true) {
        if (!views[viewId] || !mainContentArea) {
            console.error(`Vista no definida o contenedor no encontrado para ID: ${viewId}`);
            return;
        }

        const filePath = views[viewId];

        try {
            // Indicador de carga
            mainContentArea.innerHTML = `<div class="container" style="text-align:center; padding: 50px;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--color-primary);"></i><p style="margin-top: 10px;">Cargando...</p></div>`;

            // 1. Fetch del contenido HTML
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo cargar la vista desde ${filePath}`);
            }
            
            const html = await response.text();
            
            // 2. Inyección del contenido
            mainContentArea.innerHTML = html; 

            // 3. Gestión del historial 
            if (pushState) {
                history.pushState({ viewId: viewId }, '', `?view=${encodeURIComponent(viewId)}`);
            }
            
            // 4. Actualizar el estado activo de los enlaces de navegación
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                const linkView = link.getAttribute('data-view');
                
                if (linkView === viewId) {
                    link.classList.add('active');
                } else if (viewId.startsWith('post-') && linkView === 'blog') {
                    // Si estamos en un post, mantener el enlace 'Blog' activo
                    link.classList.add('active');
                }
            });

            // 5. Cerrar menú móvil y desplazar al inicio de la página
            if (navLinks) navLinks.classList.remove('open');
            window.scrollTo(0, 0); 
            
            console.log(`Vista cargada y estado de historial actualizado: ${viewId}`);

        } catch (e) {
            console.error("Fallo al cargar la vista:", e);
            mainContentArea.innerHTML = `<div class="container" style="padding: 50px;"><h2>Error de Carga</h2><p>No se pudo cargar la vista ${viewId}. Revise la consola. ${e.message}</p></div>`;
        }
    }
    
    /**
     * Función global para manejar los clics de navegación.
     */
    window.showView = function(viewId, event) {
        if (event) event.preventDefault();
        loadViewContent(viewId, true);
    }
    
    // -------------------------------------------------------------------\
    // 4. INICIALIZACIÓN (Al cargar el DOM)
    // -------------------------------------------------------------------
    
    // Toggle del Menú Hamburguesa para responsividad
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }
    
    // Manejador del evento popstate (botones atrás/adelante del navegador)
    window.onpopstate = (event) => {
        // Obtenemos la vista del estado guardado o de los parámetros de URL si es una recarga
        const stateViewId = event.state?.viewId;
        
        if (stateViewId) {
            // Cargar la vista desde el historial (sin agregar nuevo estado)
            loadViewContent(stateViewId, false);
        } else {
             // Si no hay estado, revisamos la URL
            const urlParams = new URLSearchParams(window.location.search);
            const path = urlParams.get('view') || 'inicio';
            loadViewContent(path, false); 
        }
    };
    
    // Carga inicial: Determina la vista a mostrar
    const urlParams = new URLSearchParams(window.location.search);
    const initialView = urlParams.get('view') || 'inicio';
    
    // Cargar la vista inicial al cargar la página (sin modificar el historial)
    loadViewContent(initialView, false); 
});
