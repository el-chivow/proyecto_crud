import bcrypt from 'bcrypt';
const TABLA = 'auth';
import * as auth from '../../auth/index.js';


export default function (dbInyectada) {

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql')
    }

async function login(usuario, password) {
  const resultado = await db.query(TABLA, { usuario: usuario });

  const data = resultado[0]; // ← aquí accedes al primer usuario

  if (!data) {
    throw new Error('Usuario no encontrado');
  }

  return bcrypt.compare(password, data.password).then((resultado) => {
    if (resultado === true) {
      // Generar un token
      return auth.asignarToken({ ...data });
    } else {
      throw new Error('Información inválida');
    }
  });
}
    
    async function agregar (data) {
        console.log('data', data)
        const authData = {
            id: data.id,
        }

        if(data.usuario){
            authData.usuario = data.usuario
        }

        if(data.password){
            authData.password = await bcrypt.hash(data.password.toString(), 6);
        }


        return db.agregar(TABLA, authData)
    }    

    return {
        agregar,
        login
    }
};