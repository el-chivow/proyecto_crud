

import express from 'express';

import seguridad from '../usuarios/seguridad.js'; // Middleware de autenticación
import respuesta from '../../red/respuestas.js';
import controlador from './index.js';

const router = express.Router();

// Rutas protegidas con seguridad()



router.get('/miPerfil', seguridad(), obtenerPerfilUsuario);

router.get('/', seguridad(), obtenerEntradas); //Esta es la que obteiene los datos de las entradas, whatsapp, direccion, etc
router.get('/publicos', obtenerTodasLasEntradas); //Para mostrar en el buscador



router.get('/:id', seguridad(), obtenerEntradaUnica); // Obtener entrada específica por ID

router.post('/', seguridad(), guardarEntrada);
router.put('/:id', seguridad(), actualizarEntrada);
router.delete('/', seguridad(), eliminarEntrada);  

router.post('/calificar', seguridad(), calificarNegocio);
router.get('/calificar/:negocioId', seguridad(), obtenerCalificacionNegocio);







//Para obtener el usuario
// Función que responde con los datos del usuario autenticado
async function obtenerPerfilUsuario(req, res, next) {
  try {
    const id = req.user.id;
    const usuario = await controlador.obtenerUsuario(id); // esta función ya la tienes
    
    if (!usuario) {
      return respuesta.error(req, res, 'Usuario no encontrado', 404);
    }

    // Solo devolvemos los campos que necesitas (como nombre y correo)
    const datos = {
      nombre: usuario.nombre,
      correo: usuario.correo // opcional, si lo necesitas
    };

    respuesta.success(req, res, { datos }, 200);
  } catch (err) {
    next(err);
  }
}

// Obtener todas las entradas del usuario autenticado
async function obtenerEntradas(req, res, next) {
  try {
    let datos = await controlador.obtenerEntradas(req.user.id);

      // Si la consulta incluye detalle_ids, los agregamos----------
    if (datos) {
      datos = datos.map(entry => {
        // Asegúrate de incluir detalle_ids si existen
        entry.detalle_ids = entry.detalle_ids ? entry.detalle_ids.split(',') : [];
        return entry;
      });
    }
//--------------------------- PARA VER LOS detalles_ids


    if (!Array.isArray(datos)) datos = [datos];
    respuesta.success(req, res, { datos }, 200);
  } catch (err) {
    next(err);
  }
}

// Obtener una entrada específica por ID
async function obtenerEntradaUnica(req, res, next) {
  try {
    const usuarioId = req.user.id; // ID del usuario autenticado
    const datos = await controlador.obtenerEntradaUnica(usuarioId); // No necesitas el ID de la entrada aquí
    
    if (!datos) {
      return respuesta.error(req, res, 'No se encontraron entradas para este usuario', 404);
    }

    respuesta.success(req, res, { datos }, 200);
  } catch (err) {
    next(err);
  }
}

// Guardar nueva entrada
async function guardarEntrada(req, res, next) {
  try {
    const {
      nombre,
      descripcion,
      nombre_encargado,
      nombre_negocio,
      ubicacion,
      horarios,
      envios,
      whatsapp,
      informacion_adicional,
      google_maps,
      latitud,
      longitud,

      localidad_id,
      categoria_id,
      subcategoria_id,
      detalle_ids
    } = req.body;

    // Puedes validar si al menos uno de los campos obligatorios está presente
    if (!nombre_negocio) {
      return respuesta.error(req, res, 'El nombre del negocio es requerido', 400);
    }

    const userId = req.user.id;

    const datos = {
      nombre,
      descripcion,
      nombre_encargado,
      nombre_negocio,
      ubicacion,
      horarios,
      envios,
      whatsapp,
      informacion_adicional,
      google_maps,
      latitud,
      longitud,

      localidad_id,
      categoria_id,
      subcategoria_id,
      detalle_ids
    };

      const yaExiste = await controlador.obtenerEntradas(userId);
if (yaExiste.length > 0) {
  const datosActualizados = {
    ...datos,
    negocio_id: yaExiste[0].negocio_id
  };
  await controlador.actualizarEntrada(datosActualizados, userId);
  return respuesta.success(req, res, { mensaje: "Actualizado con éxito" }, 200);
}

    const result = await controlador.guardarEntrada(datos, userId);

    respuesta.success(req, res, { mensaje: "Guardado con éxito", id: result.insertId }, 201);
  } catch (err) {
    next(err);
  }
}

// Actualizar entrada existente
async function actualizarEntrada(req, res, next) {
  try {
    const { id } = req.params; // Tomar el ID de la URL
    const {
      nombre,
      descripcion,
      nombre_encargado,
      nombre_negocio,
      ubicacion,
      horarios,
      envios,
      whatsapp,
      informacion_adicional,
      google_maps,
      latitud,
      longitud,

      localidad_id,
      categoria_id,
      subcategoria_id,
      detalle_ids
    } = req.body;

    if (!id || !nombre_negocio) {
      return respuesta.error(req, res, 'Faltan campos requeridos para actualizar', 400);
    }

    const datosActualizados = {
      negocio_id,
      nombre,
      descripcion,
      nombre_encargado,
      nombre_negocio,
      ubicacion,
      horarios,
      envios,
      whatsapp,
      informacion_adicional,
      google_maps,
      latitud,
      longitud,

      localidad_id,
      categoria_id,
      subcategoria_id,
      detalle_ids
    };

    await controlador.actualizarEntrada(datosActualizados, req.user.id);
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

async function obtenerTodasLasEntradas(req, res, next) {
  try {
    const datos = await controlador.obtenerTodas(); 

    if (!datos || datos.length === 0) {
      return respuesta.error(req, res, 'No se encontraron entradas públicas', 404);
    }
    respuesta.success(req, res, { datos }, 200);
  } catch (err) {
    next(err);
  }
}

// Calificar un negocio (POST /calificar)
async function calificarNegocio(req, res, next) {
  try {
    const usuarioId = req.user.id;
    const { negocioId, calificacion } = req.body;

    if (!negocioId || !calificacion) {
      return res.status(400).json({
        error: true,
        mensaje: 'Faltan datos para calificar'
      });
    }

    const result = await controlador.calificarNegocio(usuarioId, negocioId, calificacion);

    return res.status(200).json({
      error: false,
      mensaje: 'Calificación registrada',
      rating: result.nuevoPromedio
    });
  } catch (err) {
    console.error("Error en calificarNegocio:", err);
    next(err);
  }
}

// Obtener la calificación de un negocio (GET /calificar/:negocioId)
async function obtenerCalificacionNegocio(req, res, next) {
  try {
    const negocioId = req.params.negocioId;
    const result = await controlador.obtenerCalificacionNegocio(negocioId);

    if (result === null) {
      return res.status(404).json({
        error: true,
        mensaje: 'Negocio no encontrado'
      });
    }

    return res.status(200).json({
      error: false,
      rating: result
    });
  } catch (err) {
    console.error("Error en obtenerCalificacionNegocio:", err);
    next(err);
  }
}


export default router;