  // Cargar datos al entrar, sirve para enviar datos 
  // del dashboard a cada usuario dependiendo su id y su usuario

      window.onload = verificarSesion;

    async function verificarSesion() {
      try {
        const res = await fetch('http://localhost:4000/api/auth/protegido', {
          method: 'GET',
          credentials: 'include'
        });

        if (!res.ok) throw new Error("No autenticado");
        const data = await res.json();

        const usuario = data.usuario;
        document.getElementById("bienvenida").innerText = `🔐 Bienvenido, ${usuario.nombre || usuario.usuario}`;

        cargarEntradas(); // Cargar las entradas del usuario
      } catch (error) {
        alert("No estás autenticado. Serás redirigido al login.");
        window.location.href = "./sesion.html";
      }
    }

    async function cerrarSesion() {
      try {
        const res = await fetch("http://localhost:4000/api/auth/logout", {
          method: 'POST',
          credentials: 'include'
        });

        if (res.ok) {
          alert("🚪 Sesión cerrada correctamente");
          window.location.href = "./sesion.html";
        } else {
          alert("⚠️ No se pudo cerrar sesión");
        }
      } catch (error) {
        alert("⚠️ Error al cerrar sesión");
      }
    }

    async function cargarEntradas() {
      try {
        const res = await fetch('http://localhost:4000/api/dashboard', {
          method: 'GET',
          credentials: 'include'
        });

        const data = await res.json();
        const entradas = data.body?.datos || [];

        const contenedor = document.getElementById('entradas');
        contenedor.innerHTML = '';

        if (entradas.length > 0) {
          entradas.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('entrada');

            const fecha = new Date(item.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            div.innerHTML = `
              <strong>${item.nombre}</strong><br />
              <em>${fechaFormateada}</em><br />
              ${item.descripcion}
            `;
            contenedor.appendChild(div);
          });
        } else {
          contenedor.innerHTML = '<p>No hay entradas guardadas aún.</p>';
        }
      } catch (error) {
        console.error('Error al cargar entradas:', error);
      }
    }

    document.getElementById('formDashboard').addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const descripcion = document.getElementById('descripcion').value;
      

      try {
        const res = await fetch('http://localhost:4000/api/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ nombre, descripcion })
        });

        const result = await res.json();
        document.getElementById('mensaje').innerText = result.body?.mensaje || 'Guardado.';
        e.target.reset();
        cargarEntradas(); // recargar los datos
      } catch (error) {
        document.getElementById('mensaje').innerText = '❌ Error al guardar.';
        console.error('Error al guardar entrada:', error);
      }
    });