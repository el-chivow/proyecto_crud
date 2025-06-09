import fs from 'fs';
import path from 'path';

const TABLA = 'imagenes';

export default function (db) {
  async function obtenerImagenes(req) {
    try {
      const imagenes = await db.query(TABLA, { usuario_id: req.user.id });
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
      const rutaArchivo = path.resolve('uploads', nombreArchivo);

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
        const insertResult = await db.queryRaw(
          'INSERT INTO imagenes (usuario_id, filename, filepath) VALUES (?, ?, ?)',
          [usuarioId, img.filename, `uploads/${img.filename}`]
        );

        const idImagen = insertResult.insertId;
        const ext = path.extname(img.originalname);
        const nuevoNombre = `imagen_${idImagen}_${usuarioId}${ext}`;

        const rutaUploads = path.resolve('uploads');
        const nuevaRuta = path.join(rutaUploads, nuevoNombre);
        const rutaAntigua = path.resolve(img.path);

        fs.renameSync(rutaAntigua, nuevaRuta);

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
  };
}