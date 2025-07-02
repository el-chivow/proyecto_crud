//Sirve para autodirgir en caso de que ya haya iniciado sesion 


  import { verificar } from '../../backend/src/middleware/verificar.js'; // ajusta la ruta si está en otra carpeta

  // Verifica sesión apenas se carga la página
  window.addEventListener('DOMContentLoaded', async () => {
    const usuario = await verificar();
    if (usuario) {
      // Ya está autenticado → redirige a su perfil
      window.location.href = './miPerfil.html';
    }
  });
