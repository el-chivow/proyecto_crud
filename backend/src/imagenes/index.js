import db from '../DB/mysql.js';
import ctrl from './controlador.js';

async function probarConexionImagenesPerfil() {
  try {
    const resultados = await db.queryRaw('SELECT * FROM imagenesperfil LIMIT 1');
    console.log('Conexión y consulta OK:', resultados);
  } catch (err) {
    console.error('Error consultando imagenesperfil:', err.message);
  }
}

probarConexionImagenesPerfil();

export default ctrl(db);