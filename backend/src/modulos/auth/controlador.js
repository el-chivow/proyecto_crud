import bcrypt from 'bcrypt';
import * as auth from '../../auth/index.js';


export default function (dbInyectada) {

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql')
    }

      const TABLA_AUTH = 'auth';
      const TABLA_USUARIOS = 'usuarios';



async function login(correo, password) {
  // Paso 1: Buscar al usuario por su correo
  const resultadoUsuario = await db.query(TABLA_USUARIOS, { correo: correo });
  const usuario = resultadoUsuario[0]; // ← aquí accedes al primer usuario

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Paso 2: Buscar su contraseña en la tabla auth, usando el id del usuario

  const resultadoAuth = await db.query(TABLA_AUTH, { id: usuario.id });    
  const datosAuth = resultadoAuth[0];

    if (!datosAuth) {
      throw new Error('Credenciales no encontradas');
    }
  
      // Paso 3: Comparar contraseña
    const passwordValida = await bcrypt.compare(password, datosAuth.password);
    if (!passwordValida) {
    throw new Error('Contraseña incorrecta');
    }

        // Paso 4: Generar token con datos del usuario
       return auth.asignarToken({ 
        id: usuario.id, 
        correo: usuario.correo, 
        usuario: datosAuth.usuario });
  }

  async function agregar(data) {
    const authData = {
      id: data.id,
    };

    if (data.usuario) {
      authData.usuario = data.usuario;
    }

    if (data.password) {
      authData.password = await bcrypt.hash(data.password.toString(), 6);
    }

    return db.agregar(TABLA_AUTH, authData);
  }

  return {
    agregar,
    login,
  };
    
};