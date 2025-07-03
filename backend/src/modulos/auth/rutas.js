import express from 'express';
import respuesta from '../../red/respuestas.js';
import controlador from './index.js';
import seguridad from '../usuarios/seguridad.js'; // Middleware de autenticación






const router = express.Router();

// Login: genera token y lo guarda en cookie segura
router.post('/login', login);

// Ruta protegida: solo accesible con token válido
router.get('/protegido', seguridad(), (req, res) => {
  res.json({
    mensaje: 'Acceso autorizado',
    usuario: req.user,
  });
});

// Logout: elimina cookie
router.post('/logout', (req, res) => {
    // Eliminar la cookie 'token' al cerrar sesión

  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // ⚠️ debe coincidir con tu configuración real
    sameSite: 'Lax',
  });

  res.json({ mensaje: 'Sesión cerrada' });
});

// Función de login
async function login(req, res, next) {
  try {
    const token = await controlador.login(req.body.correo, req.body.password); 

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 días (duración del token en la cookie)
    });

    respuesta.success(req, res, { mensaje: 'Login exitoso' }, 200);
  } catch (error) {
    next(error);
  }
}

export default  router ;