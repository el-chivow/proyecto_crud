window.addEventListener('DOMContentLoaded', async () => {
    let filtroDataDos = [];
    let filtroDataTres = [];
    let filtroDataCuatro = [];
  
    const buscador = document.getElementById('buscador');
    const contenedor = document.getElementById('contenedor-buscador');
    const categoriaSelect = document.getElementById('categoria');
    const ubicacionSelect = document.getElementById('ubicacion');
    const opcionesEspecificasSelect = document.getElementById('opciones_especificas');
    const subtemasEspecificosSelect = document.getElementById('subtemas_especificos');
    
    try {
      const [categorias, subcategorias, detalles] = await Promise.all([
        fetch('./JS/filtroDataDos.json').then(res => res.json()),
        fetch('./JS/filtroDataTres.json').then(res => res.json()),
        fetch('./JS/filtroDataCuatro.json').then(res => res.json())
      ]);
  
      filtroDataDos = categorias;
      filtroDataTres = subcategorias;
      filtroDataCuatro = detalles;
  
      llenarSelectCategorias();
      inicializarListeners();
      activarBuscador();

       // 👇 Este bloque es el nuevo código que cierra la lista al hacer clic afuera
    document.addEventListener('click', function(event) {
      const dentroDelContenedor = contenedor.contains(event.target);
      const esBuscador = buscador.contains(event.target);

      if (!dentroDelContenedor && !esBuscador) {
        contenedor.classList.remove('mostrar');
        contenedor.innerHTML = '';
      }
    });



    } catch (error) {
      console.error('Error al cargar los archivos JSON:', error);
    }
  
    function llenarSelectCategorias() {
      categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
      filtroDataDos.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nombre;
        categoriaSelect.appendChild(option);
      });
    }
  
    function inicializarListeners() {
      categoriaSelect.addEventListener('change', () => {
        llenarOpcionesEspecificas(categoriaSelect.value);
        subtemasEspecificosSelect.innerHTML = '<option value="">Selecciona un subtema</option>';
      });
  
      opcionesEspecificasSelect.addEventListener('change', () => {
        llenarSubtemas(opcionesEspecificasSelect.value);
      });
    }
  
    function activarBuscador() {
      buscador.addEventListener('input', () => {
        const texto = buscador.value.toLowerCase();
        const resultados = filtroDataCuatro.filter(negocio =>
          negocio.nombre?.toLowerCase().includes(texto) ||
          negocio.descripcion?.toLowerCase().includes(texto) ||
          negocio.ubicacion?.toLowerCase().includes(texto)
        );
        mostrarResultados(resultados);
    
        // Si hay un único resultado, lo usamos para llenar filtros directamente
        if (resultados.length === 1) {
          llenarFiltros(resultados[0]);
        }
      });
    }
  
    function mostrarResultados(resultados) {
      contenedor.innerHTML = '';

      contenedor.classList.add('mostrar'); // Muestra visualmente los resultados
    
      if (resultados.length === 0) {
        // Crear el elemento <p> de manera explícita
        const mensaje = document.createElement('p');
        mensaje.textContent = 'No hay coincidencias';
    
        // Modificar el estilo directamente
        mensaje.style.color = 'red'; // Cambia el color del texto a rojo (ajusta según lo que necesites)
        mensaje.style.fontSize = '18px'; // Ajusta el tamaño de la fuente
        mensaje.style.fontWeight = 'bold'; // Puedes ponerlo en negritas si lo prefieres
    
        // Agregarlo al contenedor
        contenedor.appendChild(mensaje);
        return;
      }
    







      
    //este es lo que arroja en tiempo real
      resultados.forEach(negocio => {
  const div = document.createElement('div');
  div.classList.add('resultado-busqueda');

  div.innerHTML = `
    <div class="resultado-contenido">
      <div class="imagen-negocio">
        <!-- Aquí agregamos la imagen, con un valor por defecto si no existe -->
        <img src="${negocio.imagen || './imagenes/placeholder.jpg'}" alt="${negocio.nombre}" />
      </div>
      <div class="info-negocio">
        <p class="nombre-negocio" data-id="${negocio.id}">
          ${negocio.nombre}
        </p>
        <p class="descripcion-negocio">${negocio.descripcion || 'Sin descripción disponible'}</p>
      </div>
    </div>
  `;

  contenedor.appendChild(div);

  // Agregar evento de click a todo el div
  div.addEventListener('click', () => {
    llenarFiltros(negocio);
    buscador.value = negocio.nombre;
    contenedor.innerHTML = '';
    contenedor.classList.remove('mostrar'); // Oculta el contenedor después de seleccionar

    // 👉 Aquí activamos el botón de búsqueda manualmente
    const botonBuscar = document.getElementById('bo-buscar');
    if (botonBuscar) {
      botonBuscar.click(); // Esto simula el submit
    }
  });


});

      
    }
  
    function llenarFiltros(negocio) {
      const subcategoria = filtroDataTres.find(item => item.id === negocio.subcategoria_id);
      if (!subcategoria) return;
    
      const categoriaId = subcategoria.categoria_id;
      categoriaSelect.value = categoriaId;
    
      llenarOpcionesEspecificas(categoriaId, negocio.subcategoria_id);
    
      const detalleNombre = negocio.nombre; 
      llenarSubtemas(negocio.subcategoria_id, detalleNombre);
    }
  
    function llenarOpcionesEspecificas(categoriaId, seleccionarId = null) {
      opcionesEspecificasSelect.innerHTML = '<option value="">Selecciona una opción</option>';
      const subcategorias = filtroDataTres.filter(item => item.categoria_id == categoriaId);
  
      subcategorias.forEach(subcat => {
        const option = document.createElement('option');
        option.value = subcat.id;
        option.textContent = subcat.nombre;
        opcionesEspecificasSelect.appendChild(option);
      });
  
      if (seleccionarId) {
        opcionesEspecificasSelect.value = seleccionarId;
      }
    }
  
    function llenarSubtemas(subcategoriaId, seleccionarDetalleNombre = null) {
      subtemasEspecificosSelect.innerHTML = '<option value="">Selecciona un subtema</option>';
    
      const negociosConSubcategoria = filtroDataCuatro.filter(item => item.subcategoria_id == subcategoriaId);
      const nombresUnicos = new Set();
    
      negociosConSubcategoria.forEach(item => {
        if (!nombresUnicos.has(item.nombre)) {
          nombresUnicos.add(item.nombre);
          const option = document.createElement('option');
          option.value = item.nombre;  // Usamos el nombre directamente
          option.textContent = item.nombre;
          subtemasEspecificosSelect.appendChild(option);
        }
      });
    
      // Ahora comparas con nombre, no con ID.
      if (seleccionarDetalleNombre) {
        subtemasEspecificosSelect.value = seleccionarDetalleNombre;
      }
    }

    
  });