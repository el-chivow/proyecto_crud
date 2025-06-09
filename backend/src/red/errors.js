import respuesta from './respuestas.js';

function errors(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Error interno';

  // 🔇 Solo log en desarrollo, o solo el mensaje
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', message);
  }

  // Devuelve el error en formato limpio
  respuesta.error(req, res, message, status);
}
export default errors;

