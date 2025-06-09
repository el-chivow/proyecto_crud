

import express from 'express';

import seguridad from '../usuarios/seguridad.js'; // Middleware de autenticación
import respuesta from '../../red/respuestas.js';
import controlador from './index.js';

const router = express.Router();

// Rutas protegidas con seguridad()
router.get('/', seguridad(), obtenerEntradas);
router.post('/', seguridad(), guardarEntrada);
router.put('/', seguridad(), actualizarEntrada);
router.delete('/', seguridad(), eliminarEntrada);

// Obtener todas las entradas del usuario autenticado
async function obtenerEntradas(req, res, next) {
  try {
    let datos = await controlador.obtenerEntradas(req.user.id);
    if (!Array.isArray(datos)) datos = [datos];
    respuesta.success(req, res, { datos }, 200);
  } catch (err) {
    next(err);
  }
}

// Guardar nueva entrada
async function guardarEntrada(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return respuesta.error(req, res, 'Faltan campos requeridos', 400);
    }

    const userId = req.user.id;
    const result = await controlador.guardarEntrada({ nombre, descripcion }, userId);

    respuesta.success(req, res, { mensaje: "Guardado con éxito", id: result.insertId }, 201);
  } catch (err) {
    next(err);
  }
}

// Actualizar entrada existente
async function actualizarEntrada(req, res, next) {
  try {
    const { id, nombre, descripcion } = req.body;
    if (!id || !nombre || !descripcion) {
      return respuesta.error(req, res, 'Faltan campos requeridos para actualizar', 400);
    }

    await controlador.actualizarEntrada({ id, nombre, descripcion }, req.user.id);
    respuesta.success(req, res, { mensaje: "Actualizado con éxito" }, 200);
  } catch (err) {
    next(err);
  }
}

// Eliminar entrada por ID
async function eliminarEntrada(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) {
      return respuesta.error(req, res, 'Falta el ID para eliminar', 400);
    }

    await controlador.eliminarEntrada(id, req.user.id);
    respuesta.success(req, res, { mensaje: "Eliminado con éxito" }, 200);
  } catch (err) {
    next(err);
  }
}

export default router;