import express from 'express';
import respuesta from '../../red/respuestas.js';
import auth from '../../auth/index.js';

import controlador from './index.js'; // importa el controlador ya configurado con DB

import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import db from '../../DB/mysql.js';





const router = express.Router();


// Middleware de validación y sanitización
const validacionesRegistro = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .trim().escape(),
  body('correo')
    .isEmail().withMessage('Correo inválido')
    .normalizeEmail(),
  body('usuario')
    .notEmpty().withMessage('El usuario es obligatorio')
    .trim().escape(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];





//Ruta segura
router.post('/register', validacionesRegistro, async (req, res, next) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return respuesta.error(req, res, errores.array(), 400);
    }

    const { nombre, correo, usuario, password } = req.body;

    // Comprobar si ya existe el usuario o correo
    const existeUsuario = await db.queryRaw(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existeUsuario.length > 0) {
      return respuesta.error(req, res, 'Usuario o correo ya registrados', 409);
    }

    // 1. Insertar en `usuarios`
    const resultadoUsuario = await db.queryRaw(
      'INSERT INTO usuarios (nombre, correo) VALUES (?, ?)',
      [nombre, correo]
    );

    const idUsuario = resultadoUsuario.insertId;

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar en tabla `auth` o similar
    await db.queryRaw(
      'INSERT INTO auth (id, usuario, password) VALUES (?, ?, ?)',
      [idUsuario, usuario, hashedPassword]
    );

    return respuesta.success(req, res, {
      mensaje: '✅ Usuario registrado exitosamente',
      id: idUsuario
    }, 201);

  } catch (error) {
    next(error);
  }
});





export default router;