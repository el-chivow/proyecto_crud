import express from 'express';
import auth from '../auth/index.js';
import { generalUpload, profileUpload } from './multer.js';
import respuesta from '../red/respuestas.js';
import controlador from '../imagenes/index.js'; // aquí se importa con db ya inyectado


const router = express.Router();

router.get('/galeria', auth.confirmarToken, obtenerImagenes);
router.post('/subir', auth.confirmarToken, generalUpload.array('imagenes', 4), subirImagenes);
router.post('/subir/perfil', auth.confirmarToken, profileUpload.single('imagen'), subirImagenPerfil);
router.delete('/eliminar/:id', auth.confirmarToken, eliminarImagen);

router.get('/galeria/perfil', auth.confirmarToken, obtenerImagenPerfil);
router.delete('/eliminar/perfil/:id', auth.confirmarToken, eliminarImagenPerfil);




async function obtenerImagenes(req, res, next) {
  try {
    const data = await controlador.obtenerImagenes(req);
    respuesta.success(req, res, data, 201);
  } catch (err) {
    next(err);
  }
}

async function subirImagenes(req, res, next) {
  try {
    const data = await controlador.subirImagenes(req);
    respuesta.success(req, res, data, 201);
  } catch (err) {
    next(err);
  }
}

async function eliminarImagen(req, res, next) {
  try {
    const id = req.params.id;
    const data = await controlador.eliminarImagen(id);
    respuesta.success(req, res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function subirImagenPerfil(req, res, next) {
  try {
    const data = await controlador.subirImagenPerfil(req);
    respuesta.success(req, res, data, 201);
  } catch (err) {
    next(err);
  }
}




async function obtenerImagenPerfil(req, res, next) {
  try {
    const data = await controlador.obtenerImagenPerfil(req);
    respuesta.success(req, res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function eliminarImagenPerfil(req, res, next) {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const data = await controlador.eliminarImagenPerfil(id, userId);
    respuesta.success(req, res, data, 200);
  } catch (err) {
    next(err);
  }
}



export default router;