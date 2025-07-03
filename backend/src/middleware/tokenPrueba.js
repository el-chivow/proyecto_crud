import { verificar } from './verificar.js';

// Función para abrir el modal y mostrar información del usuario
async function abrirModal() {
  console.log("Se ejecutó abrirModal()");

  const modal = document.getElementById("modal");
  modal.style.display = "block";

  const usuario = await verificar();

if (usuario) {
  document.querySelectorAll(".solo-autenticado").forEach(el => el.classList.remove("oculto"));
  document.getElementById("nombre-usuario").textContent = `Tu ID: ${usuario.id}`;
  console.log("🧪 Usuario devuelto:", usuario);

  // 🔽 NUEVO: obtenemos y usamos los datos del perfil
  const perfil = await obtenerDatosPerfil();
      console.log("🧬 Perfil recibidoooosososo:", perfil);  // Verifica si el perfil se está recibiendo correctamente

  if (perfil) { 


    //Para meter los datos del negocio
    const datosNegocio = await obtenerDatosNegocio();

const contenedor = document.getElementById('modal-negocio');
contenedor.innerHTML = ''; // Limpiar contenido anterior

if (datosNegocio.length > 0) {
  const item = datosNegocio[0]; // Solo 1 entrada por ahora

  const fecha = new Date(item.fecha);
  const fechaFormateada = fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const div = document.createElement('div');
  div.classList.add('entrada');

  div.innerHTML = `
    <h3>${item.nombre_negocio}</h3>
    <p><strong>Nombre:</strong> ${item.nombre}</p>
    <p><strong>Encargado:</strong> ${item.nombre_encargado}</p>
    <p><strong>Descripción:</strong> ${item.descripcion}</p>
    <p><strong>Ubicación:</strong> ${item.ubicacion}</p>
    <p><strong>Horarios:</strong> ${item.horarios}</p>
    <p><strong>Envíos a domicilio:</strong> ${item.envios}</p>
    <p><strong>WhatsApp:</strong> ${item.whatsapp}</p>
    <p><strong>Más info:</strong> ${item.informacion_adicional}</p>
    <p><a href="${item.google_maps}" target="_blank">📍 Ver en Google Maps</a></p>
    <p><em>Publicado el: ${fechaFormateada}</em></p>
  `;

  contenedor.appendChild(div);
} else {
  contenedor.innerHTML = `<p>No has registrado información de tu negocio aún.</p>`;
}
//---------------------------



    console.log("🧬 Perfil cargado:", perfil);
    document.getElementById("nombre-usuario").textContent = `Hola, ${perfil.nombre}`;
    document.getElementById("correo-usuario").textContent = `Correo: ${perfil.correo}`;

    // Agrega más si tienes más campos visuales en el modal...


  }

  await cargarImagenPerfilModal();
  await cargarGaleria();
} else {
    document.querySelectorAll(".solo-invitado").forEach(el => el.classList.remove("oculto"));
  }
}

//Cargar tus entradas del dashboard (nuevo)
async function obtenerDatosNegocio() {
  try {
    const res = await fetch('http://localhost:4000/api/dashboard', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('No se pudieron obtener los datos del negocio');

    const data = await res.json();
    return data.body?.datos || [];
  } catch (error) {
    console.error('Error al obtener datos del negocio:', error);
    return [];
  }
}

//cargar los datos de usuario
async function obtenerDatosPerfil() {
  try {
    const res = await fetch('http://localhost:4000/api/dashboard/miPerfil', {
      method: 'GET',
      credentials: 'include', 
    });

    const data = await res.json();


    if (!res.ok) throw new Error(data.body || 'Error al obtener perfil');


    return data.body.datos; // ← Aquí están los datos del perfil
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    return null;
  }
}
//Cargar las entradas del dashboard


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
// Cargar la imagen de perfil EN EL MODAL (sin la x)

async function cargarImagenPerfilModal() {
  try {
    const res = await fetch('http://localhost:4000/api/imagenes/galeria/perfil', {
      credentials: 'include'
    });

    const data = await res.json();

    const img = document.getElementById('imagen-perfil-modal');

    if (data.body && data.body.imagen) {
      const src = `http://localhost:4000/${data.body.imagen.filepath}`;
      img.src = src;

      // 👉 Agrega evento para ver imagen en grande
      img.style.cursor = 'pointer';
      img.onclick = () => abrirVisor(src);

    } else {
      img.src = 'http://localhost:4000/uploads/ej.jpeg'; // Imagen por defecto
      img.onclick = null; // Eliminar comportamiento si no hay imagen real
      img.style.cursor = 'default';
    }

  } catch (error) {
    console.error('Error al cargar imagen de perfil en el modal:', error);
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




//Para la img de perfil-------------------------------------------------------------------------------------------------------------------
function crearContenedorImagenPerfil(img = null, conMenu = true, esPerfil = false) {
  const galeriaPreview = document.getElementById('galeriaPerfil-preview');
  galeriaPreview.innerHTML = ''; // Limpiar cualquier imagen anterior

  const contenedor = document.createElement('div');
  contenedor.className = 'contenedor-perfil perfil-preview';

  const imagen = document.createElement('img');
  imagen.className = 'imagen-perfil';

  if (img && img.filepath) {
    imagen.src = `http://localhost:4000/${img.filepath}`;
  } else {
    imagen.src = 'public/img/avatar-default.png';
  }

  imagen.onclick = () => abrirVisor(imagen.src);
  contenedor.appendChild(imagen);

  if (conMenu) {
    const iconoCamara = document.createElement('div');
    iconoCamara.className = 'icono-camara';
    iconoCamara.innerHTML = '📷';

    const menuOpciones = document.createElement('div');
    menuOpciones.className = 'menu-opciones';
    menuOpciones.innerHTML = `
      <div class="opcion" onclick="document.getElementById('inputImagenPerfil').click()">Cambiar foto</div>
      ${img && img.id ? `<div class="opcion" onclick="eliminarImagenPerfil(${img.id}, ${esPerfil})">Eliminar</div>` : ''}
    `;

    iconoCamara.onclick = (e) => {
      e.stopPropagation();
      menuOpciones.classList.toggle('visible');
    };

    document.addEventListener('click', () => {
      menuOpciones.classList.remove('visible');
    });

    // 🔁 Añadir icono y menú
    contenedor.appendChild(iconoCamara);
    contenedor.appendChild(menuOpciones);
  }

  galeriaPreview.appendChild(contenedor);
}


async function eliminarImagenPerfil(id, esPerfil) {
  const confirmar = confirm("¿Eliminar esta imagen?");
  if (!confirmar) return;

  try {
    const url = `http://localhost:4000/api/imagenes/eliminar/perfil/${id}`;
    await axios.delete(url, { withCredentials: true });
    await cargarGaleria();
    if (esPerfil) await cargarImagenPerfil();
  } catch (e) {
    alert('Error al eliminar la imagen');
    console.error('Error axios:', e);
  }
}
window.eliminarImagenPerfil = eliminarImagenPerfil;




  //Para subir foto de perfil
document.getElementById('formPerfil').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = await verificar();
  if (!usuario) {
    alert("⚠️ Debes iniciar sesión para subir tu foto de perfil.");
    return;
  }

  const formData = new FormData(e.target);

  try {
    const res = await fetch('http://localhost:4000/api/imagenes/subir/perfil', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await res.json();
    console.log(data);
    await cargarImagenPerfil();
  } catch (error) {
    console.error("❌ Error al subir imagen de perfil:", error);
    alert("❌ Ocurrió un error al subir tu imagen de perfil.");
  }
});

//Para ver y eliminar foto de perfil
 // Función para cargar la imagen de perfil desde el backend
  async function cargarImagenPerfil() {
    try {
      const res = await fetch('http://localhost:4000/api/imagenes/galeria/perfil', {
        credentials: 'include'
      });

      const data = await res.json();

      // const contenedor = document.getElementById('perfil-container');
      // contenedor.innerHTML = ''; // Limpiar cualquier contenido previo

if (data.body && data.body.imagen) {
  const contenedor = crearContenedorImagenPerfil(data.body.imagen, true, true);
  contenedor.classList.add('perfil-preview');
  document.getElementById('galeriaPerfil-preview').prepend(contenedor);
} else {
  // Si no hay imagen, muestra la imagen por defecto
  crearContenedorImagenPerfil(null, true, true);
}

  } catch (error) {
    console.error('Error cargando imagen de perfil', error);
  }
}



  // Cargar la imagen de perfil cuando la página se cargue
  window.addEventListener('DOMContentLoaded', cargarImagenPerfil);


// Mostrar el botón “Subir” solo si se selecciona una imagen nueva
  const inputImagen = document.getElementById('inputImagenPerfil');
const btnSubir = document.getElementById('btnSubir');

inputImagen.addEventListener('change', () => {
  if (inputImagen.files && inputImagen.files[0]) {
    
    btnSubir.style.display = 'inline-block';

    const reader = new FileReader();
    reader.onload = function (e) {
      crearContenedorImagenPerfil({ filepath: '' }, true, true); // Refresca para mantener la cámara visible
      const imgTag = document.querySelector('.imagen-perfil');
      imgTag.src = e.target.result; // Previsualiza la nueva imagen
    };
    reader.readAsDataURL(inputImagen.files[0]);
  }
});

//----------------------------------------------------------





