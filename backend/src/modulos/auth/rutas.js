import express from 'express';
import respuesta from '../../red/respuestas.js';
import controlador from './index.js';
import seguridad from '../usuarios/seguridad.js'; // Middleware de autenticación
import error from '../../middleware/errors.js';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import db from '../../DB/mysql.js';





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
    const token = await controlador.login(req.body.usuario, req.body.password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,           // solo HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000  // 1 hora
    });

    respuesta.success(req, res, { mensaje: 'Login exitoso' }, 200);
  } catch (error) {
    next(error);
  }
}

export default  router ;