import bcrypt from 'bcrypt';
const TABLA = 'usuarios';

export default function(dbInyectada) {
  let db = dbInyectada;

  if (!db) {
    db = require('../../DB/mysql');
  }

  async function agregar(body) {
    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const usuario = {
      nombre: body.nombre,
      correo: body.correo,
      usuario: body.usuario,
      password: hashedPassword // Guarda la contraseña hasheada
    };

    try {
      const resultado = await db.agregar(TABLA, usuario);
      return {
        mensaje: '✅ Usuario registrado exitosamente',
        id: resultado.insertId
      };
    } catch (error) {
      throw new Error('❌ Error al registrar usuario: ' + error.message);
    }
  }

  return {
    agregar
  };
};