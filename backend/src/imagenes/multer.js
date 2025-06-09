import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Obtener __dirname del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta a la carpeta /uploads al nivel de app.js
const uploadDir = path.join(__dirname, '../../uploads');

// Crear la carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido'), false);
  }

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Extensión de archivo no permitida'), false);
  }

  if (file.originalname.match(/\.(js|ts|exe|sh|bat|env|php)$/i)) {
    return cb(new Error('Archivo potencialmente peligroso'), false);
  }

  cb(null, true);
};

const reserved = ['con', 'aux', 'nul', 'prn', 'com1', 'lpt1'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    let base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9_\-]/gi, '_')
      .toLowerCase();

    if (reserved.includes(base)) {
      base = 'archivo_' + base;
    }

    const filename = Date.now() + '-' + base + ext;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 4,
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

export { upload };