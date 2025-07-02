import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const TABLA = 'imagenes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (db) {

  //Para poder mostrar y eliminar las 4 fotos subidas permitidas
async function obtenerImagenes(req) {
  try {
    const imagenes = await db.queryRaw(
      'SELECT id, filename, filepath FROM imagenes WHERE usuario_id = ?',
      [req.user.id]
    );
    return { imagenes };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
}

  async function eliminarImagen(id) {
    try {
      const resultado = await db.queryRaw('SELECT filename FROM imagenes WHERE id = ?', [id]);

      if (!resultado || resultado.length === 0) {
        const err = new Error('Imagen no encontrada');
        err.statusCode = 404;
        throw err;
      }

      const nombreArchivo = resultado[0].filename;
      const rutaArchivo = path.join(__dirname, '../uploads', nombreArchivo);

      if (fs.existsSync(rutaArchivo)) {
        fs.unlinkSync(rutaArchivo);
      }

      await db.queryRaw('DELETE FROM imagenes WHERE id = ?', [id]);

      return { mensaje: 'Imagen eliminada correctamente', id };
    } catch (err) {
      err.statusCode = err.statusCode || 500;
      throw err;
    }
  }
  //-------------------------------//

  //Para poder mostrar y eliminar la foto de perfil
  async function obtenerImagenPerfil(req) {
  try {
    const resultado = await db.queryRaw(
      'SELECT id, nombre_archivo AS filename, ruta_archivo AS filepath FROM imagenesperfil WHERE usuario_id = ?',
      [req.user.id]
    );

    if (!resultado || resultado.length === 0) {
      return { imagen: null }; // No hay imagen de perfil
    }

    return { imagen: resultado[0] };
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    throw err;
  }
}

async function eliminarImagenPerfil(id, userId) {
  try {
    const rows = await db.queryRaw(
      'SELECT * FROM imagenesperfil WHERE id = ? AND usuario_id = ? AND es_perfil = 1',
      [id, userId]
    );

    if (!rows || rows.length === 0) {
      const err = new Error('No se encontró la imagen de perfil');
      err.statusCode = 404;
      throw err;
    }

    const imagen = rows[0];
    const rutaAbsoluta = path.resolve(__dirname, '../uploads', path.basename(imagen.ruta_archivo));
    console.log('Ruta absoluta:', rutaAbsoluta);

    if (fs.existsSync(rutaAbsoluta)) {
      fs.unlinkSync(rutaAbsoluta);
    } else {
      console.warn('Archivo no encontrado en disco:', rutaAbsoluta);
    }

    await db.queryRaw('DELETE FROM imagenesperfil WHERE id = ?', [id]);

    return { mensaje: 'Imagen de perfil eliminada correctamente' };
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    throw err;
  }
}

//-------------------------------//



  //imagen de perfil
async function subirImagenPerfil(req) {
  const usuarioId = req.user.id;
  const imagen = req.file;

  try {
    if (!imagen) {
      const err = new Error('No se subió la imagen.');
      err.statusCode = 400;
      throw err;
    }

    // Generar el nombre de la imagen
    const ext = path.extname(imagen.originalname);
    const nuevoNombre = `perfil_id_${usuarioId}.webp`;
    
    // Definir las rutas de los archivos
    const rutaUploads = path.join(__dirname, '../uploads');
    const rutaAntigua = imagen.path;
    const nuevaRuta = path.join(rutaUploads, nuevoNombre);

    // Renombrar el archivo subido
    if (fs.existsSync(nuevaRuta)) {
      fs.unlinkSync(nuevaRuta); // Si ya existe, eliminarla
    }

    fs.renameSync(rutaAntigua, nuevaRuta);

// Redimensionar y optimizar con Sharp (opcional: puedes ajustar tamaño/calidad)
await sharp(nuevaRuta)
  .resize({ width: 800, height: 800, fit: 'inside' }) // opcional, ancho máx
  .webp({ quality: 80 })  
  .toFile(nuevaRuta + '_temp');

fs.renameSync(nuevaRuta + '_temp', nuevaRuta);

    // Eliminar la imagen de perfil anterior (si existe)
    await db.queryRaw('DELETE FROM imagenesperfil WHERE usuario_id = ?', [usuarioId]);

    // Insertar la nueva imagen en la tabla `imagenesperfil`
    const insertResult = await db.queryRaw(
      'INSERT INTO imagenesperfil (usuario_id, nombre_archivo, ruta_archivo, es_perfil) VALUES (?, ?, ?, 1)',
      [usuarioId, nuevoNombre, `uploads/${nuevoNombre}`]
    );

    return {
      mensaje: 'Imagen de perfil actualizada correctamente.',
      imagen: {
        usuario_id: usuarioId,
        filename: nuevoNombre,
        filepath: `uploads/${nuevoNombre}`
      }
    };
  } catch (err) {
    console.error('Error en subirImagenPerfil:', err);
    err.statusCode = err.statusCode || 500;
    throw err;
  }
}





  //Imagenes de sus productos
  async function subirImagenes(req) {
    const usuarioId = req.user.id;
    const imagenes = req.files;

    try {
      if (!imagenes || imagenes.length === 0) {
        const err = new Error('No se subieron imágenes.');
        err.statusCode = 400;
        throw err;
      }

      const resultado = await db.queryRaw(
        'SELECT COUNT(*) AS cantidad FROM imagenes WHERE usuario_id = ?',
        [usuarioId]
      );
      const cantidadActual = resultado[0].cantidad;

      if (cantidadActual + imagenes.length > 4) {
        const err = new Error('Solo puedes tener hasta 4 imágenes.');
        err.statusCode = 400;
        throw err;
      }

      const imagenesFinales = [];

for (const img of imagenes) {
  const ext = path.extname(img.originalname);
  const rutaUploads = path.join(__dirname, '../uploads');
  const rutaAntigua = img.path;

  // 1. Crea nombre personalizado *temporalmente*
  const tempId = Date.now(); // solo por si acaso necesitas algo temporal

  // 2. Inserta primero para obtener ID real
  const insertResult = await db.queryRaw(
    'INSERT INTO imagenes (usuario_id, filename, filepath) VALUES (?, ?, ?)',
    [usuarioId, 'temp', 'temp']
  );

  const idImagen = insertResult.insertId;
  const nuevoNombre = `imagen_${idImagen}_${usuarioId}.webp`;
  const nuevaRuta = path.join(rutaUploads, nuevoNombre);

  // 3. Renombrar archivo
  fs.renameSync(rutaAntigua, nuevaRuta);

  // 4. Optimizar con Sharp
  await sharp(nuevaRuta)
    .resize({ width: 800, height: 800, fit: 'inside' })
    .webp({ quality: 80 })
    .toFile(nuevaRuta + '_temp');

  fs.renameSync(nuevaRuta + '_temp', nuevaRuta);

  // 5. Ahora sí: actualizar correctamente el nombre final
  await db.queryRaw(
    'UPDATE imagenes SET filename = ?, filepath = ? WHERE id = ?',
    [nuevoNombre, `uploads/${nuevoNombre}`, idImagen]
  );

  imagenesFinales.push({
    id: idImagen,
    usuario_id: usuarioId,
    filename: nuevoNombre,
    filepath: `uploads/${nuevoNombre}`,
  });
}

      return {
        mensaje: 'Imágenes subidas correctamente.',
        imagenes: imagenesFinales,
      };
    } catch (err) {
      err.statusCode = err.statusCode || 500;
      throw err;
    }
  }

  return {
    obtenerImagenes,
    subirImagenes,
    eliminarImagen,
    subirImagenPerfil,
    obtenerImagenPerfil,
    eliminarImagenPerfil
  };
}