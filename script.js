// Variables globales
// Se declara un arreglo global que contendrá objetos de tareas, cada una con texto, estado de completado, fecha e ID.
    let tareas = [];

// Elementos DOM
//Se almacenan referencias a los elementos del HTML para interactuar con ellos (input, botones, lista, notificación, etc.).
    const input = document.getElementById("tareaInput");
    const boton = document.getElementById("agregarBtn");
    const lista = document.getElementById("listaTareas");
    const guardarJsonBtn = document.getElementById("guardarJsonBtn");
    const copiarJsonBtn = document.getElementById("copiarJsonBtn");
    const marcarTodasBtn = document.getElementById("marcarTodasBtn");
    const limpiarBtn = document.getElementById("limpiarBtn");
    const jsonPreview = document.getElementById("jsonPreview");
    const notification = document.getElementById("notification");

    // Inicialización
    window.onload = function() {
      cargarTareas();
      renderizarTareas();
      actualizarVistaJson();
      
      // Event Listeners
      boton.addEventListener("click", agregarTarea);
      input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") agregarTarea();
      });
      
      guardarJsonBtn.addEventListener("click", descargarJson);
      copiarJsonBtn.addEventListener("click", copiarJson);
      marcarTodasBtn.addEventListener("click", marcarTodasTareas);
      limpiarBtn.addEventListener("click", limpiarTareasCompletadas);
    };
    
    // Funciones de gestión de tareas
    //Toma el texto que escribiste, verifica que no esté vacío, 
    // crea una nueva tarea con ID único, fecha y estado pendiente, la guarda en la lista, 
    // muestra en pantalla, limpia el input y lanza una notificación.
    function agregarTarea() {
      const texto = input.value.trim();
      
      if (texto === "") {
        mostrarNotificacion("Escribe algo antes de agregar una tarea.", "error");
        return;
      }
      
      const nuevaTarea = {
        id: Date.now(),
        texto: texto,
        completada: false,
        fechaCreacion: new Date().toISOString()
      };
      
      tareas.push(nuevaTarea);
      guardarTareas();
      renderizarTareas();
      actualizarVistaJson();
      
      input.value = "";
      input.focus();
      mostrarNotificacion("Tarea agregada correctamente");
    }
    
    // Busca y elimina la tarea que tenga ese ID de la lista, 
    // luego actualiza la pantalla y guarda los cambios.
    function eliminarTarea(id) {
      tareas = tareas.filter(tarea => tarea.id !== id);
      guardarTareas();
      renderizarTareas();
      actualizarVistaJson();
      mostrarNotificacion("Tarea eliminada");
    }
    
    //Cambia el estado de una tarea (de completada a pendiente o viceversa) y 
    //actualiza la lista y el almacenamiento.
    function toggleCompletada(id) {
      tareas = tareas.map(tarea => 
        tarea.id === id ? {...tarea, completada: !tarea.completada} : tarea
      );
      guardarTareas();
      renderizarTareas();
      actualizarVistaJson();
    }
    // Si todas las tareas están marcadas como completadas, las pone como pendientes; 
    // si no, las marca todas como completadas, y muestra un mensaje según el caso.
    function marcarTodasTareas() {
      const todasCompletadas = tareas.every(t => t.completada);
      
      tareas = tareas.map(tarea => ({
        ...tarea,
        completada: !todasCompletadas
      }));
      
      guardarTareas();
      renderizarTareas();
      actualizarVistaJson();
      
      mostrarNotificacion(
        todasCompletadas ? 
        "Todas las tareas marcadas como pendientes" : 
        "Todas las tareas marcadas como completadas"
      );
    }
    //Elimina todas las tareas que ya están completadas de la lista, 
    //actualiza la pantalla y guarda los cambios.
    function limpiarTareasCompletadas() {
      tareas = tareas.filter(tarea => !tarea.completada);
      guardarTareas();
      renderizarTareas();
      actualizarVistaJson();
      mostrarNotificacion("Tareas completadas eliminadas");
    }
    
    // Funciones de persistencia
    //Convierte la lista de tareas a texto en formato JSON y 
    // la guarda en el almacenamiento local del navegador.
    function guardarTareas() {
      localStorage.setItem('tareas', JSON.stringify(tareas));
    }
    
    //Busca si hay tareas guardadas en el navegador y 
    //las convierte de texto a una lista para usarlas.
    function cargarTareas() {
      const tareasGuardadas = localStorage.getItem('tareas');
      tareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
    }
    
    // Funciones de JSON
    //Muestra las tareas como texto en 
    // formato JSON dentro de un área en la pantalla.
    function actualizarVistaJson() {
      jsonPreview.textContent = JSON.stringify(tareas, null, 2);
    }
    
    //Crea un archivo con las tareas en formato JSON 
    // y lo descarga automáticamente.
    function descargarJson() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tareas, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "tareas.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      mostrarNotificacion("Archivo JSON descargado");
    }
    // Copia el texto JSON de las tareas al portapapeles y 
    // muestra un mensaje si tuvo éxito o falló.
    function copiarJson() {
      const jsonContent = JSON.stringify(tareas, null, 2);
      navigator.clipboard.writeText(jsonContent)
        .then(() => {
          mostrarNotificacion("JSON copiado al portapapeles");
        })
        .catch(err => {
          mostrarNotificacion("Error al copiar: " + err, "error");
        });
    }
    
    // Funciones de UI
    // Limpia la lista en pantalla y vuelve a dibujar todas las tareas una por una con sus 
    // botones de marcar y eliminar; si no hay tareas, muestra un mensaje diciendo que la lista está vacía.
    function renderizarTareas() {
      lista.innerHTML = '';
      
      if (tareas.length === 0) {
        lista.innerHTML = `
          <div class="empty-state">
            <h3>No hay tareas</h3>
            <p>Comienza agregando una nueva tarea</p>
          </div>
        `;
        return;
      }
      
      tareas.forEach(tarea => {
        const li = document.createElement('li');
        li.className = `tarea-item ${tarea.completada ? 'completada' : ''}`;
        
        li.innerHTML = `
          <div class="tarea-texto">${tarea.texto}</div>
          <div class="tarea-acciones">
            <button class="btn-icon" style="background: ${tarea.completada ? '#ff9e00' : '#4CAF50'}" title="${tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}">
              <i class="fas ${tarea.completada ? 'fa-undo' : 'fa-check'}"></i>
            </button>
            <button class="btn-icon" style="background: #f44336" title="Eliminar tarea">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        
        li.querySelector('.tarea-acciones button:first-child').addEventListener('click', () => toggleCompletada(tarea.id));
        li.querySelector('.tarea-acciones button:last-child').addEventListener('click', () => eliminarTarea(tarea.id));
        
        lista.appendChild(li);
      });
    }
    
    //Muestra un pequeño mensaje en pantalla 
    //que desaparece después de 3 segundos.
    function mostrarNotificacion(mensaje, tipo = "success") {
      notification.textContent = mensaje;
      notification.className = "notification show";
      notification.style.background = tipo === "error" ? "var(--danger)" : "var(--primary)";
      
      setTimeout(() => {
        notification.className = "notification";
      }, 3000);
    }