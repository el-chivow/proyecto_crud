// modulos/dashboard/controlador.js

const TABLA = 'datos';

export default function(dbInyectada) {
  let db = dbInyectada;

  if (!db) {
    db = require('../../DB/mysql');
  }

  // Guardar nueva entrada del dashboard
async function guardarEntrada(data, userId) {
  const nuevaEntrada = {
    nombre: data.nombre,
    descripcion: data.descripcion,
    nombre_encargado: data.nombre_encargado,
    nombre_negocio: data.nombre_negocio,
    ubicacion: data.ubicacion,
    horarios: data.horarios,
    envios: data.envios,
    whatsapp: data.whatsapp,
    informacion_adicional: data.informacion_adicional,
    google_maps: data.google_maps,
    latitud: data.latitud,
    longitud: data.longitud,
    usuarios_id: userId,

    // Campos nuevos
    localidad_id: data.localidad_id,
    categoria_id: data.categoria_id,
    subcategoria_id: data.subcategoria_id
  };

  // 👉 Primero guardamos la entrada principal
  const resultado = await db.agregar(TABLA, nuevaEntrada);
  const negocio_id = resultado.insertId;

  // 👉 Luego insertamos los detalles en la tabla intermedia
  if (Array.isArray(data.detalle_ids)) {
    for (const detalleId of data.detalle_ids) {
      await db.agregar('detalles_datos', {
        negocio_id,
        detalle_id: detalleId
      });
    }
  }

  return { ...nuevaEntrada, id: negocio_id };
}

  // Obtener todas las entradas del usuario autenticado
  async function obtenerEntradas(userId) {
    return db.query(TABLA, { usuarios_id: userId });
  }

async function obtenerEntrada(usuarioId) {
  console.log(`Obteniendo entrada para el usuario con ID: ${usuarioId}`);
  
  try {
    const resultado = await db.query(TABLA, { usuarios_id: usuarioId });

    if (!resultado || resultado.length === 0) {
      console.log(`No se encontró ninguna entrada para el usuario con ID: ${usuarioId}`);
      return null;
    }

    return resultado[0];
  } catch (error) {
    console.error('Error al obtener la entrada:', error);
    throw error;
  }
}

  // Actualizar entrada existente (por ID y validando usuario)
  async function actualizarEntrada(data, userId) {
    const condiciones = {
      negocio_id: data.negocio_id,
      usuarios_id: userId, // seguridad: sólo actualiza si pertenece al usuario
    };

    const camposActualizar = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      nombre_encargado: data.nombre_encargado,
      nombre_negocio: data.nombre_negocio,
      ubicacion: data.ubicacion,
      horarios: data.horarios,
      envios: data.envios,
      whatsapp: data.whatsapp,
      informacion_adicional: data.informacion_adicional,
      google_maps: data.google_maps,
      latitud: data.latitud || null,
      longitud: data.longitud || null
    };

    return db.actualizar(TABLA, camposActualizar, condiciones);
  }

  // Eliminar entrada (por ID y validando usuario)
  async function eliminarEntrada(id, userId) {
    const condiciones = {
      id: id,
      usuarios_id: userId, // seguridad: sólo elimina si pertenece al usuario
    };

    return db.eliminar(TABLA, condiciones);
  }

  //Para poder obtener el usuario de la tabla usuarios
  async function obtenerUsuario(id) {
  try {
        // Trae los datos básicos del usuario
    const resultado = await db.query('usuarios', { id }); // Usa tu helper db.query(tabla, condiciones)
    return resultado[0]; // Devuelve el primer usuario
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw error;
  }
}

//Para la ubicación con los datos lat y long direcamente con la API de google maps-------------------------------

async function guardarUbicacion(data) {
  try {
    return await db.agregar(TABLA, data); // data incluye latitud, longitud, usuarios_id
  } catch (error) {
    console.error("Error al guardar la ubicación:", error);
    throw error;
  }
}
async function obtenerUbicacion(usuarios_id) {
  try {
    // Asumiendo que 'datos' es la tabla donde se guarda la ubicación
    const resultado = await db.query('datos', { usuarios_id });


    // Si hay resultados, devuelve el primer resultado, de lo contrario devuelve null
    return resultado[0] || null;
  } catch (error) {
    console.error("Error al obtener la ubicación:", error);
    throw error;
  }
}


async function actualizarUbicacion({ latitud, longitud }, userId) {
  try {
    const resultado = await db.actualizar(TABLA, { latitud, longitud }, { usuarios_id: userId });

    if (resultado.affectedRows === 0) {
      // No existía: hacemos insert (crear fila nueva)
      return await db.agregar(TABLA, { usuarios_id: userId, latitud, longitud });
    }

    return resultado;
  } catch (error) {
    console.error("Error al actualizar la ubicación:", error);
    throw error;
  }
}
//------------------------------------------------
//CASO ESPECIAL, POR EL TEMA DEL ARREGLO A LA HORA DEL REGISTRO DE LO QUE SE VENDE Y SE MUESTRA AL PUBLICO (CHATGPT ME AYUDÓ A ESTO)-------------------
async function obtenerTodas() {
  const sql = `
    SELECT d.*, GROUP_CONCAT(dd.detalle_id) AS detalle_ids
    FROM datos d
    LEFT JOIN detalles_datos dd ON d.negocio_id = dd.negocio_id
    GROUP BY d.negocio_id
  `;

  const resultados = await db.queryRaw(sql);

  // Convertir string "163,164" a [163, 164]
  return resultados.map(row => ({
    ...row,
    detalle_ids: row.detalle_ids
      ? row.detalle_ids.split(',').map(Number)
      : []
  }));
}
//---------------------------------------------------

//------------------------------------------- TODO ESTE BLOQUE ES PARA LA CALIFICACION POR ESTRELLAS
async function calificarNegocio(usuarioId, negocioId, calificacion) {
  // Verifica si el usuario ya calificó este negocio
  const existe = await db.query('calificaciones', {
    usuarios_id: usuarioId,
    negocio_id: negocioId
  });

  if (existe.length > 0) {
    // Ya existe, actualizar
    await db.actualizar('calificaciones', { calificacion }, {
      usuarios_id: usuarioId,
      negocio_id: negocioId
    });
  } else {
    // Insertar nueva calificación
    await db.agregar('calificaciones', {
      usuarios_id: usuarioId,
      negocio_id: negocioId,
      calificacion
    });
  }

  // Calcular nuevo promedio
  const resultados = await db.queryRaw(`
    SELECT AVG(calificacion) AS promedio
    FROM calificaciones
    WHERE negocio_id = ?`, [negocioId]);

  const nuevoPromedio = resultados[0].promedio;

  // Actualizar en la tabla datos
  await db.actualizar('datos', { rating: nuevoPromedio }, { id: negocioId });

  return { nuevoPromedio };
}

//Obtener los datos del raiting:
async function obtenerCalificacionNegocio(negocioId) {
  try {
    const result = await db.query('datos', { negocio_id: negocioId });

    if (result.length === 0) {
      return null;
    }

    const rating = result[0].rating || 2.5;
    return rating;
  } catch (err) {
    console.error("Error al obtener calificación del negocio:", err);
    throw err;
  }
}
//--------------------------------------------
  return {
    guardarEntrada,
    obtenerEntradas,
    actualizarEntrada,
    eliminarEntrada,
    obtenerEntrada,
    obtenerUsuario,
    guardarUbicacion,
     obtenerUbicacion,
    actualizarUbicacion,
    obtenerTodas,
    calificarNegocio,
    obtenerCalificacionNegocio
  };
};