export async function verificar() {
  try {
    const res = await fetch('http://localhost:4000/api/auth/protegido', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      console.warn('⚠️ Usuario no autenticado (401).');
      return false;
    }

    const data = await res.json();
    console.log("Datos recibidos desde /protegido:", data);

 // Aquí solo verificamos el mensaje
    if (data.mensaje === 'Acceso autorizado') {
      return true;  // Usuario autenticado
    }

    return false;  // Si no coincide el mensaje (no autorizado)
  } catch (e) {
    console.error('❌ Error al verificar sesión:', e.message);
    return false;  // Si ocurre un error, consideramos que no está autenticado
  }
}