
//
import { verificarToken } from '../../auth/index.js';
export default function checkAuth() {
    function middleware(req, res, next) {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Token ausente' });
        }

        try {
            const datos = verificarToken(token); // decodifica el token
            req.user = datos; // guarda los datos del usuario en la request
            next();
        } catch (err) {
            res.status(401).json({ error: 'Token inválido o expirado' });
        }
    }
    return middleware;
}