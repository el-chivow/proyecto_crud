export async function verificar() {
  try {
    const res = await fetch('http://localhost:4000/api/auth/protegido', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      // Puedes hacer un console.warn opcional aquí
      console.warn('⚠️ Usuario no autenticado (401).');
      return null;
    }

    const data = await res.json();
    return data.usuario;
  } catch (e) {
    console.error('❌ Error al verificar sesión:', e.message);
    return null;
  }
}