window.onload = function () {
    const usuarioString = localStorage.getItem('usuario');

    if (!usuarioString) {
        // Evita navegación hacia atrás y redirige a index
        window.location.replace('index.htm');
        return;
    }

    // Solo si el usuario existe, carga lo demás
    cargarUsuarios();
    mostrarUsuario();

    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) loadingScreen.style.display = 'none';
};

document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const contraseña = document.getElementById('contraseña').value;
    const rol = document.getElementById('rol').value;

    const response = await fetch('http://nodejs-repuestos-production.up.railway.app/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, email, contraseña, rol, })
    });

    const data = await response.json();
    alert(data.message);

    
    cargarUsuarios();
});

async function cargarUsuarios() {
    const response = await fetch('http://nodejs-repuestos-production.up.railway.app/api/users', {
        credentials: 'include'
    });
    const usuarios = await response.json();

    const tabla = document.getElementById('userTableBody');
    tabla.innerHTML = ''; 

    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td>${usuario.rol}</td>
            <td>${new Date(usuario.fecha_creacion).toLocaleString()}</td>
            <td>
                <button onclick="editarUsuario(${usuario.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="eliminar" onclick="eliminarUsuario(${usuario.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tabla.appendChild(row);
    });
}

async function eliminarUsuario(id) {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
        await fetch(`http://nodejs-repuestos-production.up.railway.app/api/users/${id}`, { method: 'DELETE',credentials: 'include' });
        cargarUsuarios(); 
    }
}

async function editarUsuario(id) {
    const nuevoNombre = prompt("Nuevo nombre:");
    const nuevoEmail = prompt("Nuevo email:");
    const nuevoRol = prompt("Nuevo rol (admin/empleado):");
    const nuevaContraseña = prompt("Nueva contraseña (deja vacío para no cambiarla):");

    if (nuevoNombre && nuevoEmail && nuevoRol) {
        const body = {
            nombre: nuevoNombre,
            email: nuevoEmail,
            rol: nuevoRol
        };

        if (nuevaContraseña && nuevaContraseña.trim() !== '') {
            body.contraseña = nuevaContraseña;
        }

        await fetch(`http://nodejs-repuestos-production.up.railway.app/api/users/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        cargarUsuarios(); 
    }
}

document.getElementById('logoutButton').addEventListener('click', async function() {
    try {
        const response = await fetch('http://nodejs-repuestos-production.up.railway.app/api/logout', { method: 'POST', credentials: 'include'
         });

        if (response.ok) {
            localStorage.removeItem('usuario');
            location.replace('index.htm');
        } else {
            alert('Error al cerrar sesión');
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
});


function mostrarUsuario() {
    const usuarioString = localStorage.getItem('usuario');
    
    if (!usuarioString) {
        alert("No has iniciado sesión");
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioString);
    
    document.getElementById('nombreUsuario').textContent = usuario.nombre;
    document.getElementById('rolUsuario').textContent = usuario.rol;

    if (usuario.rol === 'empleado') {
        // Redirigir directamente al módulo de reportes
        if (!window.location.href.includes('reportes.html')) {
            window.location.href = 'reportes.html';
            return;
        }

        // Ocultar módulo de usuarios
        const gestionUsuarios = document.getElementById('gestionUsuarios');
        if (gestionUsuarios) {
            gestionUsuarios.style.display = 'none';
        }

        // Bloquear opción en el menú lateral
        const usuariosMenu = document.querySelector('nav ul li a[href="#"]');
        if (usuariosMenu) {
            usuariosMenu.addEventListener('click', (e) => {
                e.preventDefault();
                alert("No tienes permisos para acceder a esta sección.");
            });
        }
    }
}

document.getElementById("btnExportPDFUsuarios").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    // Cargar imagen
    const img = new Image();
    img.src = "../imagenes/logo1.png"; // Tu ruta a la imagen
  
    img.onload = function () {
      // Cuando la imagen haya cargado, la dibujamos
      doc.addImage(img, 'PNG', 10, 5, 40, 20); 
      // (x:150, y:5, ancho:40, alto:20) 
  
      // Agregar título
      doc.text("Listado de Usuarios", 80, 30);
  
      // Agregar tabla
      doc.autoTable({
        html: '#tabla-usuarios',
        startY: 40,
        didParseCell: function (data) {
          if (data.cell.raw && data.cell.raw.classList.contains('no-export')) {
            data.cell.text = '';
          }
        }
      });
  
      // Guardar PDF
      doc.save("usuarios.pdf");
    };
  });
  
  
  document.getElementById("btnExportExcelUsuarios").addEventListener("click", () => {
    const originalTable = document.getElementById("tabla-usuarios");
    const clonedTable = originalTable.cloneNode(true);
  
    clonedTable.querySelectorAll(".no-export").forEach(el => el.remove());
  
    const wb = XLSX.utils.table_to_book(clonedTable, { sheet: "Usuarios" });
    XLSX.writeFile(wb, "usuarios.xlsx");
  });
  