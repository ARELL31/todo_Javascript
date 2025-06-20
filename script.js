// Variables globales
    let tareas = [];
    
    // Elementos DOM
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
    
    function eliminarTarea(id) {
      tareas = tareas.filter(tarea => tarea.id !== id);
      guardarTareas();
      renderizarTareas();
      actualizarVistaJson();
      mostrarNotificacion("Tarea eliminada");
    }
    
    function toggleCompletada(id) {
      tareas = tareas.map(tarea => 
        tarea.id === id ? {...tarea, completada: !tarea.completada} : tarea
      );
      guardarTareas();
      renderizarTareas();
      actualizarVistaJson();
    }
    
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
    
    function limpiarTareasCompletadas() {
      tareas = tareas.filter(tarea => !tarea.completada);
      guardarTareas();
      renderizarTareas();
      actualizarVistaJson();
      mostrarNotificacion("Tareas completadas eliminadas");
    }
    
    // Funciones de persistencia
    function guardarTareas() {
      localStorage.setItem('tareas', JSON.stringify(tareas));
    }
    
    function cargarTareas() {
      const tareasGuardadas = localStorage.getItem('tareas');
      tareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
    }
    
    // Funciones de JSON
    function actualizarVistaJson() {
      jsonPreview.textContent = JSON.stringify(tareas, null, 2);
    }
    
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
    function renderizarTareas() {
      lista.innerHTML = '';
      
      if (tareas.length === 0) {
        lista.innerHTML = `
          <div class="empty-state">
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIj48L2NpcmNsZT48bGluZSB4MT0iMTIiIHkxPSI4IiB4Mj0iMTIiIHkyPSIxMiI+PC9saW5lPjxsaW5lIHgxPSIxMiIgeTE9IjE2IiB4Mj0iMTIuMDEiIHkyPSIxNiI+PC9saW5lPjwvc3ZnPg==" alt="Lista vacía">
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
    
    function mostrarNotificacion(mensaje, tipo = "success") {
      notification.textContent = mensaje;
      notification.className = "notification show";
      notification.style.background = tipo === "error" ? "var(--danger)" : "var(--primary)";
      
      setTimeout(() => {
        notification.className = "notification";
      }, 3000);
    }