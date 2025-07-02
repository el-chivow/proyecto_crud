let localidades = [];
let categorias = [];
let subcategorias = [];
let detalles = [];
let dummyData = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Cargar todos los JSON en paralelo
    const [locData, catData, subcatData, detData, dataJson] = await Promise.all([
      fetch("./JS/filtroDataUno.json").then(res => res.json()),
      fetch("./JS/filtroDataDos.json").then(res => res.json()),
      fetch("./JS/filtroDataTres.json").then(res => res.json()),
      fetch("./JS/filtroDataCuatro.json").then(res => res.json()),



      fetch("./JS/data.json").then(res => res.json())

      // fetch("http://localhost:4000/api/dashboard/publicos") En cuanto tenga todos los datos en mi base de datos
      //mientras va a jalar de data.json, es provisional 

      // TODAS LAS DIRECCIONES ESTÁN APUNTANDO A NIVEL LOCA, EN PRODUCCION SOLO CAMBIAREMOS DIRECCION DEL SERVIDOR
      //PROPORCIONADO POR MI GESTOR DE SERVIDORES

      // .then(res => res.json())
      // .then(res => res.body.datos)



    ]);
        
    localidades = locData;
    categorias = catData;
    subcategorias = subcatData;
    detalles = detData;
    dummyData = dataJson;

    initFiltros();   // Inicializa los selects (filtros)
    initSearch();    // Inicializa la búsqueda y resultados

  } catch (error) {
    console.error("❌ Error al cargar los archivos JSON:", error);
  }
});


//Para despliegue del menu responisve
  const botonMenu = document.querySelector('.menu-icon');
  const menu = document.querySelector('.menu');
  // Mostrar/ocultar al hacer clic en el botón
  botonMenu.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita que el clic se propague y lo cierre de inmediato
    menu.classList.toggle('show');
  });
  // Ocultar el menú si se hace clic fuera de él
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('show') && !menu.contains(e.target)) {
      menu.classList.remove('show');
    }
  });
  // Prevenir que el clic dentro del menú lo cierre
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
  });




// Función para inicializar los filtros
function initFiltros() {
  const ubicacionSelect = document.getElementById("ubicacion");
  const categoriaSelect = document.getElementById("categoria");
  const optionSelect = document.getElementById("opciones_especificas");
  const subtopicSelect = document.getElementById("subtemas_especificos");

  // Filtro 1 - Ubicación
  ubicacionSelect.innerHTML = '<option value="" disabled selected>Seleccione una ubicación</option>';
  ubicacionSelect.innerHTML += '<option value="todo">TODAS LAS OPCIONES EN EL MUNICIPIO</option>';
  localidades.forEach(loc => {
    const opt = document.createElement("option");
    // Aquí se usa loc.id (número); si quieres usar el nombre, puedes poner loc.nombre
    opt.value = loc.id;
    opt.textContent = loc.nombre;
    ubicacionSelect.appendChild(opt);
  });

  // Filtro 2 - Categoría
  categoriaSelect.innerHTML = '<option value="" disabled selected>Seleccione una opción</option>';
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    // Usamos cat.id para trabajar con IDs numéricos
    opt.value = cat.id;
    opt.textContent = cat.nombre;
    categoriaSelect.appendChild(opt);
  });

  // Filtro 3 - Subcategorías
  categoriaSelect.addEventListener("change", function () {
    const categoriaId = parseInt(this.value);
    optionSelect.innerHTML = '<option value="" disabled selected>Seleccione una opción específica</option>';
    subtopicSelect.innerHTML = '<option value="" disabled selected>Seleccione un subtema específico</option>';

    const subcategoriasFiltradas = subcategorias.filter(sc => sc.categoria_id === categoriaId);
    subcategoriasFiltradas.forEach(option => {
      const opt = document.createElement("option");
      opt.value = option.id;
      opt.textContent = option.nombre;
      optionSelect.appendChild(opt);
    });
  });

  // Filtro 4 - Detalles
  optionSelect.addEventListener("change", function () {
    const subcategoriaId = parseInt(this.value);
    subtopicSelect.innerHTML = '<option value="" disabled selected>Seleccione un subtema específico</option>';

    const detallesFiltrados = detalles.filter(d => d.subcategoria_id === subcategoriaId);
    detallesFiltrados.forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub.id;
      opt.textContent = sub.nombre;
      subtopicSelect.appendChild(opt);
    });
  });
}

// Función para inicializar la búsqueda
function initSearch() {
  const searchForm = document.getElementById("searchForm");
  const resultsContainer = document.getElementById("resultsContainer");
  const resultsSection = document.getElementById("results");
  const noResultsMessage = document.getElementById("noResultsMessage");

  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Convertimos a número donde corresponde
      const categoria = parseInt(document.getElementById("categoria").value);
      const localidad = document.getElementById("ubicacion").value; // Si es un ID numérico, puedes usar parseInt(localidad)
      const subcategoria = parseInt(document.getElementById("opciones_especificas").value);
      const detalle = parseInt(document.getElementById("subtemas_especificos").value);

      resultsContainer.innerHTML = "";
      noResultsMessage.style.display = "none";

      // Filtrado de dummyData usando IDs
      const filteredData = dummyData.filter((item) => {
        const matchCategoria = item.categoria_id === categoria;        
        const matchSubcategoria = isNaN(subcategoria) || item.subcategoria_id === subcategoria;
        // Aquí modificamos el filtrado para que cuando la localidad sea "todo", no filtre por localidad
        const matchLocalidad = localidad === "todo" || item.localidad_id === parseInt(localidad);
        
        const matchDetalle = isNaN(detalle) ||
          (Array.isArray(item.detalle_ids)
            ? item.detalle_ids.includes(detalle)
            : item.detalle_ids === detalle);

        return matchCategoria && matchSubcategoria && matchLocalidad && matchDetalle;
      });

      if (filteredData.length > 0) {
        filteredData.forEach((item) => {
          const card = document.createElement("div");
          card.classList.add("result-card");
          card.innerHTML = `
            <div class="result-card" data-id="${item.id}" ... >
            <img src="${item.foto}" alt="${item.nombre}">
            <h3>${item.nombre}</h3>
            <p><strong>Negocio:</strong> ${item.negocio}</p>            
            <h6>${item.ubicacion_full}</h6>       
          `;

          card.dataset.lugarFoto = item.foto_lugar;
          card.dataset.googleLink = item.link_google;
          card.dataset.elWhats = item.whatsapp;
          card.dataset.horarios = item.horarios;
          card.dataset.enviosDomicilio = item.envios_domicilio;
          card.dataset.informacionAdicional = item.informacion_adicional;
          card.dataset.rating = item.rating || 0;

          resultsContainer.appendChild(card);
        });
        resultsSection.style.display = "block";
      } else {
        noResultsMessage.style.display = "block";
        resultsSection.style.display = "block";
      }
      //Para que te lleve al resultado con un scroll suave
      if (filteredData.length > 0) {
        filteredData.forEach((item) => {
          const card = document.createElement("div");
          // ... resto del contenido de la tarjeta
          resultsContainer.appendChild(card);
        });
        resultsSection.style.display = "block";
      } else {
        noResultsMessage.style.display = "block";
        resultsSection.style.display = "block";
      }
      
      // Desplazarse a la sección de resultados
      resultsSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Modal y sus eventos
  const modal = document.getElementById("modal");
  const modalContent = document.querySelector(".modal-content");
  const modalInfo = document.getElementById("modalInfo");
  const closeModal = document.getElementById("closeModal");

  const openModal = () => {
    modal.style.display = "flex";
    document.body.classList.add("modal-open");
  };

  const closeModalFunction = () => {
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  };

  if (modal && closeModal) {
    modal.style.display = "none"; // Asegura que el modal esté oculto al cargar

    modal.addEventListener("click", (e) => {
      if (!modalContent.contains(e.target)) {
        closeModalFunction();
      }
    });

    closeModal.addEventListener("click", closeModalFunction);
  }

  document.addEventListener("click", function (e) {
    if (e.target.id === "whatsappBtn") {
      const phoneNumber = e.target.getAttribute("data-whatsapp");
      if (phoneNumber && phoneNumber.trim()) {
        const whatsappURL = `https://wa.me/${phoneNumber.trim()}`;
        window.open(whatsappURL, "_blank");
      } else {
        alert("Número de WhatsApp no disponible.");
      }
    }
  });
  //A partir de aqui lo que va en el modal principal, el que todos ven y usar verficar para que los iniciados sesion puedan ver
resultsContainer.addEventListener("click", (e) => {
  if (e.target.closest(".result-card")) {
    const card = e.target.closest(".result-card");

    const name = card.querySelector("h3").textContent || "Nombre no proporcionado";
    const businessElement = card.querySelector("p strong");
    const business = businessElement ? businessElement.nextSibling.nodeValue.trim() : "Información no disponible";
    const location = card.querySelector("h6")?.textContent.trim() || "Ubicación no disponible";
    const horarios = card.dataset.horarios || "Horarios no disponibles";
    const enviosDomicilio = card.dataset.enviosDomicilio || "Información no disponible";
    const whatsapp = card.dataset.elWhats || "No disponible";
    const lugarFoto = card.dataset.lugarFoto;
    const googleLink = card.dataset.googleLink;
    const informacionAdicional = card.dataset.informacionAdicional || "Información adicional no disponible";
    const rating = parseInt(card.dataset.rating) || 0;
    const negocioId = card.dataset.id;  // Asegúrate de que cada tarjeta tenga su negocioId

    modalInfo.innerHTML = `
      <p><strong>Encargado:</strong> ${name}</p>
      <p><strong>Negocio:</strong> ${business}</p>
      <p><strong>Ubicación:</strong> ${location}</p>
      <p><strong>Horarios:</strong> ${horarios}</p>
      <p><strong>Envíos a Domicilio:</strong> ${enviosDomicilio}</p>
      <p><strong>WhatsApp o llamada:</strong> ${whatsapp}</p>
      <button class="buttonwhats" id="whatsappBtn" data-whatsapp="${whatsapp}">
        Contactar por WhatsApp
      </button>
      <div style="text-align: center; margin-top: 10px;">
        <strong style="display: block; margin-bottom: 5px; font-size: 16px;">FOTO DEL LUGAR</strong>
        <div style="display: inline-block; padding: 10px; background: #f8f8f8; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);">
          <img src="${lugarFoto}" alt="Foto de ${name}" style="max-width: 100%; height: auto; border-radius: 10px; display: block;">
        </div>
      </div>
      <p><strong>Información adicional:</strong> ${informacionAdicional}</p>
      <p><strong>Seguir ruta en Google Maps: </strong>
        <a href="${googleLink}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; font-weight: bold;">
          Google Maps
        </a>
      </p>
      <div class="stars" data-rating="${rating}">
        <p><strong>Calificación:</strong></p>
        <span class="star" data-value="1">★</span>
        <span class="star" data-value="2">★</span>
        <span class="star" data-value="3">★</span>
        <span class="star" data-value="4">★</span>
        <span class="star" data-value="5">★</span>
      </div>
    `;

// Actualizar las estrellas ya calificadas
const stars = modalInfo.querySelectorAll(".star");
stars.forEach((star) => {
  const value = parseInt(star.getAttribute("data-value"));
  if (value <= rating) {
    star.classList.add("filled");
  }
});

// Manejo de clics en estrellas para calificar
stars.forEach((star) => {
  star.addEventListener("click", function () {
    const calificacion = parseInt(star.getAttribute("data-value"));

        // Confirmación de la calificación
    if (confirm(`¿Estás seguro de calificar con ${calificacion} estrellas?`)) {
      // Llamar al backend para calificar el negocio
      fetch(`/api/dashboard/calificar/${negocioId}`, {
        method: 'POST',
        credentials: 'include', // importante si usas cookies HTTPOnly

        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          negocioId: negocioId,
          calificacion: calificacion,
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          alert("Calificado con éxito");
          // Actualizar la visualización del rating en el frontend
          updateRatingDisplay(negocioId, data.rating);
        } else {
          alert("Hubo un problema al calificar.");
        }
      })
      .catch(error => {
        console.error("Error al calificar:", error);
        alert("Error al calificar.");
      });
    }
  });
});



function updateRatingDisplay(negocioId, nuevoRating) {
  const card = document.querySelector(`.result-card[data-id="${negocioId}"]`);
  const stars = card.querySelectorAll(".star");

  stars.forEach(star => {
    const value = parseInt(star.getAttribute("data-value"));
    if (value <= nuevoRating) {
      star.classList.add("filled");
    } else {
      star.classList.remove("filled");
    }
  });

  // Actualizar el texto de la calificación en la tarjeta
  const ratingDisplay = card.querySelector('.rating-display');
  if (ratingDisplay) {
    ratingDisplay.textContent = `${nuevoRating} estrellas`;
  }
}
//Obtener los datos:
// Obtener la calificación al cargar el modal o cuando sea necesario
fetch(`http://localhost:4000/api/dashboard/calificar/${negocioId}`)
  .then(res => res.json())
  .then(data => {
    const rating = data.rating;
    // Actualizar las estrellas en el frontend
    actualizarRatingEnFrontend(rating);
  })
  .catch(error => {
    console.error('Error al obtener la calificación:', error);
  });

// Función para actualizar las estrellas en el frontend
function actualizarRatingEnFrontend(rating) {
  const stars = document.querySelectorAll(".star");

  stars.forEach(star => {
    const value = parseInt(star.getAttribute("data-value"));
    if (value <= rating) {
      star.classList.add("filled");
    } else {
      star.classList.remove("filled");
    }
  });
}



    openModal();
  }
});

// Función para actualizar la visualización de las estrellas con el nuevo rating
function updateRatingDisplay(negocioId, newRating) {
  const card = document.querySelector(`.result-card[data-id="${negocioId}"]`);
  const stars = card.querySelectorAll(".star");

  stars.forEach(star => {
    const value = parseInt(star.getAttribute("data-value"));
    if (value <= newRating) {
      star.classList.add("filled");
    } else {
      star.classList.remove("filled");
    }
  });
}


}

// Esperar a que toda la página esté cargada
window.addEventListener('load', () => {
  const navBg = document.querySelector('.nav-bg');
  if (navBg) {
    navBg.scrollIntoView({ behavior: 'smooth' }); // Desplazamiento suave
  }
});

