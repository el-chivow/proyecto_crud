import { verificar } from './verificar.js';

// Función para abrir el modal y mostrar información del usuario
async function abrirModal() {
      console.log("Se ejecutó abrirModal()");

  const modal = document.getElementById("modal");
  modal.style.display = "block";

  const usuario = await verificar();

  if (usuario) {
    document.querySelectorAll(".solo-autenticado").forEach(el => el.classList.remove("oculto"));
    document.getElementById("nombre-usuario").textContent = `Usuario: ${usuario.nombre}`;
document.getElementById("foto-exclusiva").src =
  usuario.ruta_imagen
    ? `http://localhost:4000/uploads/${usuario.ruta_imagen}`
    : 'http://localhost:4000/uploads/foto_por_defecto.png';
    await cargarGaleria();
  } else {
    document.querySelectorAll(".solo-invitado").forEach(el => el.classList.remove("oculto"));
  }
}

// Función para cerrar el modal y limpiar contenido
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
  document.querySelectorAll(".solo-autenticado, .solo-invitado").forEach(el => el.classList.add("oculto"));
  document.getElementById("galeria").innerHTML = "";
  document.getElementById("mensaje-subida").textContent = "";
}

// Cargar imágenes del usuario
async function cargarGaleria() {
  try {
    const res = await axios.get('http://localhost:4000/api/imagenes/galeria', {
      withCredentials: true
    });

    const data = res.data;
    const galeria = document.getElementById('galeria'); // Modal
    const galeriaPreview = document.getElementById('galeria-preview'); // Vista previa

    galeria.innerHTML = '';
    galeriaPreview.innerHTML = '';

const imagenes = data.body?.imagenes || [];

if (imagenes.length > 0) {
  imagenes.forEach(img => {
    galeria.appendChild(crearContenedorImagen(img, false));
    galeriaPreview.appendChild(crearContenedorImagen(img, true));
  });
} else {
  galeria.textContent = 'No hay imágenes aún.';
  galeriaPreview.textContent = 'No hay imágenes aún.';
}

  } catch (error) {
    console.error('Error al cargar la galería:', error.response?.data || error.message);
  }
}

// Crear contenedor de imagen
function crearContenedorImagen(img, conEliminar = true) {
  const contenedor = document.createElement('div');
  contenedor.style.display = 'inline-block';
  contenedor.style.position = 'relative';
  const imagen = document.createElement('img');




imagen.src = `http://localhost:4000/${img.filepath}`;




  imagen.width = 100;
  imagen.style.cursor = 'pointer';
imagen.onclick = () => abrirVisor(`http://localhost:4000/${img.filepath}`); 


  contenedor.appendChild(imagen);

  if (conEliminar) {
    const btn = document.createElement('button');
    btn.textContent = '❌';
    btn.style.position = 'absolute';
    btn.style.top = '0';
    btn.style.right = '0';
    btn.onclick = async () => {
      const confirmar = confirm("¿Estás seguro de eliminar esta imagen?");
      if (!confirmar) return;

      try {
        await axios.delete(`http://localhost:4000/api/imagenes/eliminar/${img.id}`, {
          withCredentials: true
        });
        await cargarGaleria();
      } catch (e) {
        alert('Error al eliminar');
      }
    };
    contenedor.appendChild(btn);
  }

  return contenedor;
}

// Subir imágenes
document.getElementById('formulario-imagenes').addEventListener('submit', async (e) => {
  e.preventDefault();

  const input = document.getElementById('input-imagenes');
  const mensaje = document.getElementById('mensaje-subida');
  const formData = new FormData();

  // Añadir imágenes al formData
  for (const file of input.files) {
    formData.append('imagenes', file);
  }

  try {
    const res = await axios.post('http://localhost:4000/api/imagenes/subir', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    // ✅ Si la subida es exitosa
    mensaje.textContent = '✅ Imágenes subidas correctamente.';
    mensaje.style.color = 'green';
    input.value = ''; // Limpiar input después de subir
    await cargarGaleria(); // Refrescar la galería
  } catch (error) {
    // ❌ Si hay un error
    const status = error.response?.status;
    const mensajeServidor = error.response?.data?.message || error.response?.data?.body;

    // Mensaje amigable
    mensaje.textContent = `❌ ${mensajeServidor || 'Ocurrió un error al subir las imágenes. Inténtalo nuevamente.'}`;
    mensaje.style.color = 'red';

    // Solo muestra en consola errores críticos (no 400)
    if (!status || status >= 500) {
      console.error('Error al subir las imágenes:', error);
    }
  }
});

// Visor de imágenes ampliadas
function abrirVisor(src) {
  const visor = document.createElement('div');
  visor.style.position = 'fixed';
  visor.style.top = 0;
  visor.style.left = 0;
  visor.style.width = '100%';
  visor.style.height = '100%';
  visor.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  visor.style.display = 'flex';
  visor.style.alignItems = 'center';
  visor.style.justifyContent = 'center';
  visor.style.zIndex = 1000;

  const imagen = document.createElement('img');
  imagen.src = src;
  imagen.style.maxWidth = '90%';
  imagen.style.maxHeight = '90%';
  imagen.style.borderRadius = '8px';
  imagen.style.boxShadow = '0 0 15px #000';

  visor.appendChild(imagen);
  document.body.appendChild(visor);

  visor.onclick = () => document.body.removeChild(visor);

  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape' && document.body.contains(visor)) {
      document.body.removeChild(visor);
      document.removeEventListener('keydown', handler);
    }
  });
}

// Al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
  const usuario = await verificar();
  if (usuario) {
    await cargarGaleria();
  }

  const btnAbrir = document.getElementById('btn-ver-detalles');
  const btnCerrar = document.getElementById('btn-cerrar-modal');

  if (btnAbrir) {
    btnAbrir.addEventListener('click', abrirModal);
  }

  if (btnCerrar) {
    btnCerrar.addEventListener('click', cerrarModal);
  }
});