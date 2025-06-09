import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import config from './config.js';

import clientes from './modulos/clientes/rutas.js';
import usuarios from './modulos/usuarios/rutas.js';
import auth from './modulos/auth/rutas.js';
import dashboard from './modulos/dashboard/rutas.js';
import authRoutes from './modulos/register/rutas.js';

import error from './red/errors.js';

import imagenesRouter from '../src/imagenes/rutas.js'; // ruta al archivo correcto



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const app = express();

app.use(cors({ // Permite peticiones desde HTML externo
  origin: 'http://localhost:5500', //  el puerto donde sirves tu HTML
  credentials: true                //  Esto permite enviar cookies
}));



//Middleware
app.use(morgan('dev'));
app.use(cookieParser()); // <-- Necesario para leer cookies

app.use(express.json());



// Sirve archivos estáticos desde la carpeta /register
app.use(express.static(path.join(__dirname, 'register')));
// Ruta estática para acceder a las imágenes
app.use(express.static(path.join(__dirname, 'public'))); // para imágenes estáticas







app.use(express.urlencoded({ extended: true }));
//configuración
app.set('port', config.app.port)

//rutas

app.use('/api/clientes', clientes)
app.use('/api/usuarios', usuarios)
app.use('/api/auth', auth)
app.use('/api/dashboard', dashboard);
app.use('/api', authRoutes);
app.use('/api/imagenes', imagenesRouter);

// Servir la carpeta pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));





//ERRORES DE MULTER, Middleware para capturar errores específicos de multer
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('Extensión de archivo no permitida')) {
    return res.status(400).json({
      error: true,
      status: 400,
      body: err.message
    });
  }

  // Si no es un error de multer, pásalo al siguiente middleware
  next(err);
});

// Middleware general de errores
app.use(error);




export default app;