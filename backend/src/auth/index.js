import jwt from 'jsonwebtoken';
import config from '../config.js'; // Asegúrate que `config.js` exporte correctamente
import respuesta from '../red/respuestas.js';
import error from '../middleware/errors.js';
const secret = config.jwt.secret;

// 🔐 Genera un token con los datos del usuario
export function asignarToken(data) {
    // 🔐 Solo incluir lo necesario en el payload del token
    const payload = {
        id: data.id,
        usuario: data.usuario
        // Puedes agregar más campos si son seguros (ej. roles, email, etc.)
    };

    return jwt.sign(payload, secret, {
        expiresIn: '1h'
    });
}

// 🔍 Verifica que el token sea válido
export function verificarToken(token) {
    return jwt.verify(token, secret);
}

// ✅ Middleware que revisa si el token existe y es válido (desde cookie)
export function confirmarToken(req, res, next) {

    const token = req.cookies.token; // accede al token desde la cookie

    if (!token) {
        return respuesta.error(req, res, '⛔ No autorizado: token faltante', 401);
    }

    try {
        const decodificado = verificarToken(token);
        req.user = decodificado; // guarda los datos del token en req.user
        next();
    } catch (err) {
        next(error('❌ Token inválido o expirado', 401));
    }
}

export default {
    asignarToken,
    verificarToken,
    confirmarToken
};