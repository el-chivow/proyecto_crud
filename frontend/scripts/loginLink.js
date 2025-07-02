  import { verificar } from '../../backend/src/middleware/verificar.js'; // Ajusta la ruta

  window.onload = async () => {
    const usuario = await verificar();

    if (usuario) {
      const loginLink = document.getElementById('loginLink');
      if (loginLink) {
        loginLink.href = 'miPerfil.html';
        loginLink.textContent = 'Mi perfil';
      }
    }
  };