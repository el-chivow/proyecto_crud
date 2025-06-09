document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggleFiltros');
    const resetBtn = document.getElementById('resetFiltros');
    const contenedorFiltros = document.getElementById('contenedor-filtros');
    const filtros = [
      document.getElementById('filtro2'),
      document.getElementById('filtro3'),
      document.getElementById('filtro4')
    ];
    const filtro1 = document.getElementById('filtro1'); // Filtro de ubicación
    const buscador = document.getElementById('buscador'); // Campo de búsqueda
    const resultsContainer = document.getElementById('resultsContainer'); // Contenedor de resultados
    const noResultsMessage = document.getElementById('noResultsMessage'); // Mensaje de no resultados
  
    // Ocultar al inicio con clase
    filtros.forEach(filtro => {
      filtro.classList.add('filtro-oculto');
    });
  
    // Mostrar/ocultar filtros
    toggleBtn.addEventListener('click', () => {
      const estabanOcultos = filtros[0].classList.contains('filtro-oculto');
  
      filtros.forEach(filtro => {
        filtro.classList.toggle('filtro-oculto');
        filtro.classList.toggle('filtro-visible');
      });
  
      if (estabanOcultos) {
        setTimeout(() => {
          contenedorFiltros.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300); // Espera a que la transición se vea
      }
    });
  
    // Limpiar filtros, buscador, resultados y mensaje de no resultados al presionar el botón de reset
    resetBtn.addEventListener('click', () => {
      // Limpiar el filtro de ubicación
      const ubicacionSelect = filtro1.querySelector('select');
      if (ubicacionSelect) {
        ubicacionSelect.selectedIndex = 0; // Restaura la selección al primer valor (por defecto)
      }
  
      // Limpiar campos de filtros (selects)
      filtros.forEach(filtro => {
        const select = filtro.querySelector('select');
        if (select) {
          select.selectedIndex = 0; // Restaura la selección al primer valor (por defecto)
        }
      });
  
      // Limpiar el campo de búsqueda
      buscador.value = '';
  
      // Limpiar los resultados
      resultsContainer.innerHTML = ''; // Borra el contenido de los resultados


  // Resetear la sección de resultados
    const resultsSection = document.querySelector('#results');
    if (resultsSection) {
        // Resetear el título de resultados si es necesario
        const resultsTitle = resultsSection.querySelector('h2');
        if (resultsTitle) {
            resultsTitle.textContent = 'Resultados'; // Restaura el título original
        }

        // Asegurarse de que la sección de resultados no esté visible si no hay resultados
        resultsSection.style.display = 'none'; // O 'block' si deseas mantenerla visible por defecto
    }

    // Volver a establecer los filtros ocultos
    filtros.forEach(filtro => {
        filtro.classList.add('filtro-oculto');
        filtro.classList.remove('filtro-visible');
    });
  
      // Desplazarse al div nav.bg
      const navBg = document.querySelector('.nav-bg');
      if (navBg) {
        navBg.scrollIntoView({ behavior: 'smooth' }); // Desplazamiento suave
      }
    });
  });