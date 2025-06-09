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
      usuarios_id: userId,
    };

    return db.agregar(TABLA, nuevaEntrada);
  }

  // Obtener todas las entradas del usuario autenticado
  async function obtenerEntradas(userId) {
    return db.query(TABLA, { usuarios_id: userId });
  }

  // Actualizar entrada existente (por ID y validando usuario)
  async function actualizarEntrada(data, userId) {
    const condiciones = {
      id: data.id,
      usuarios_id: userId, // seguridad: sólo actualiza si pertenece al usuario
    };

    const camposActualizar = {
      nombre: data.nombre,
      descripcion: data.descripcion,
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

  return {
    guardarEntrada,
    obtenerEntradas,
    actualizarEntrada,
    eliminarEntrada,
  };
};