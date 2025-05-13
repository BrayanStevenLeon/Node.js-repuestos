// Función única para chequear sesión Y mostrar/ocultar la página
async function initPagina() {
  const usuario = localStorage.getItem('usuario');
  if (!usuario) {
    alert('No has iniciado sesión');
    // Si quieres limpiar todo antes de redirigir, descomenta:
    // document.body.innerHTML = '';
    // Redirige sin dejar rastro
    window.location.replace('index.htm');
  } else {
    // Pasa la validación: mostramos la página y arrancamos tu módulo
    document.body.style.visibility = 'visible';

    // Aquí va tu inicialización original:
    mostrarUsuario();
    await cargarCategorias();
    await cargarProveedores();
    await cargarProductos();
  }
}

// Ejecutamos tanto en DOMContentLoaded como en pageshow
window.addEventListener('DOMContentLoaded', initPagina);
window.addEventListener('pageshow', initPagina);


const apiUrl = 'http://localhost:4000/api/inventory/productos';

// Cargar Categorías 
async function cargarCategorias() {
    try {
        const response = await fetch("http://localhost:4000/api/inventory/categorias");
        const categorias = await response.json();
        const selectCategoria = document.getElementById("categoria");

        selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
        modalCategoriaTable.innerHTML = '';
        categorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            selectCategoria.appendChild(option);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${cat.nombre}</td>
                <td>${cat.descripcion}</td>
                <td>${new Date(cat.fecha_creacion).toLocaleString()}</td>
                <td>
                    <button id="editarCategoria" onclick="editarCategoria(${cat.id}, '${cat.nombre}', '${cat.descripcion}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button id="eliminarCategoria" onclick="eliminarCategoria(${cat.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            modalCategoriaTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}
// agregar editar y eliminar Categorias
document.getElementById("formCategoria").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.getElementById("categoriaId").value;
    const nombre = document.getElementById("categoriaNombre").value.trim();
    const descripcion = document.getElementById("categoriaDescripcion").value.trim();
    console.log("Datos enviados al backend:", { nombre, descripcion });
    const data = { nombre, descripcion };
   
    const url = id ? `http://localhost:4000/api/inventory/categorias/editar/${id}` : "http://localhost:4000/api/inventory/categorias/agregar";
    const method = id ? "PUT" : "POST";
    
    try {
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        alert(id ? "Categoría actualizada" : "Categoría agregada");
        document.getElementById("formCategoria").reset();
        document.getElementById("categoriaId").value = "";
        cargarCategorias();
    } catch (error) {
        console.error("Error al guardar categoría:", error);
    }
});

function editarCategoria(id, nombre, descripcion) {
    document.getElementById("categoriaId").value = id;
    document.getElementById("categoriaNombre").value = nombre;
    document.getElementById("categoriaDescripcion").value = descripcion;
}

async function eliminarCategoria(id) {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
        try {
            await fetch(`http://localhost:4000/api/inventory/categorias/eliminar/${id}`, {
                method: "DELETE"
            });
            alert("Categoría eliminada");
            cargarCategorias();
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
        }
    }
}
//
async function cargarProveedores() {
    try {
        const response = await fetch("http://localhost:4000/api/inventory/proveedores");
        const proveedores = await response.json();
        const selectProveedor = document.getElementById("proveedor");
        const modalProveedorTable = document.getElementById("modalProveedorTable");

        selectProveedor.innerHTML = '<option value="">Seleccione un proveedor</option>';
        modalProveedorTable.innerHTML = ''; 

        proveedores.forEach(prov => {
            
            const option = document.createElement("option");
            option.value = prov.id;
            option.textContent = prov.nombre;
            selectProveedor.appendChild(option);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${prov.nombre}</td>
                <td>${prov.contacto}</td>
                <td>${prov.telefono}</td>
                <td>${prov.email}</td>
                <td>${prov.direccion}</td>
                <td>
                    <button id="editarProveedor" onclick="editarProveedor(${prov.id}, '${prov.nombre}', '${prov.contacto}', '${prov.telefono}', '${prov.email}', '${prov.direccion}' )"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button id="eliminarProveedor" onclick="eliminarProveedor(${prov.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            modalProveedorTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar proveedores:", error);
    }
}

//agrega edita y elimina proveedores

document.getElementById("formProveedor").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.getElementById("proveedorId").value;
    const nombre = document.getElementById("proveedorNombre").value.trim();
    const contacto = document.getElementById("proveedorContacto").value.trim();
    const telefono = document.getElementById("proveedorTelefono").value.trim();
    const email = document.getElementById("proveedorEmail").value.trim();
    const direccion = document.getElementById("proveedorDireccion").value.trim();

    const data = { nombre, contacto, telefono, email, direccion };
    const url = id ? `http://localhost:4000/api/inventory/proveedores/editar/${id}` : "http://localhost:4000/api/inventory/proveedores/agregar";
    const method = id ? "PUT" : "POST";

    try {
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        alert(id ? "Proveedor actualizado" : "Proveedor agregado");
        document.getElementById("formProveedor").reset();
        document.getElementById("proveedorId").value = "";
        cargarProveedores();
    } catch (error) {
        console.error("Error al guardar proveedor:", error);
    }
});

// Llenar formulario para editar proveedor
function editarProveedor(id, nombre, contacto, telefono, email, direccion) {
    document.getElementById("proveedorId").value = id;
    document.getElementById("proveedorNombre").value = nombre;
    document.getElementById("proveedorContacto").value = contacto;
    document.getElementById("proveedorTelefono").value = telefono;
    document.getElementById("proveedorEmail").value = email;
    document.getElementById("proveedorDireccion").value = direccion;
}

// Eliminar proveedor
async function eliminarProveedor(id) {
    if (confirm("¿Estás seguro de eliminar este proveedor?")) {
        try {
            await fetch(`http://localhost:4000/api/inventory/proveedores/eliminar/${id}`, {
                method: "DELETE"
            });
            alert("Proveedor eliminado");
            cargarProveedores();
        } catch (error) {
            console.error("Error al eliminar proveedor:", error);
        }
    }
}

// Manejar el formulario de productos
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    // 1. Obtén el usuario
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
      alert('No has iniciado sesión');
      return;
    }
  
    const id = document.getElementById('productId').value;
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
    const categoria_id = document.getElementById('categoria').value;
    const proveedor_id = document.getElementById('proveedor').value;
    const imagen = document.getElementById('imagen').files[0];
  
    // 2. Arma el FormData
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio);
    formData.append('stock', stock);
    formData.append('categoria_id', categoria_id);
    formData.append('proveedor_id', proveedor_id);
    
    // <-- aquí agregas el usuario_id -->
    formData.append('usuario_id', usuario.id);
  
    if (imagen) {
      formData.append('imagen', imagen);
    }
  
    try {
      if (id) {
        await fetch(`${apiUrl}/editar/${id}`, {
          method: 'PUT',
          body: formData
        });
        alert('Producto actualizado con éxito');
      } else {
        await fetch(`${apiUrl}/agregar`, {
          method: 'POST',
          body: formData
        });
        alert('Producto agregado con éxito');
      }
  
      limpiarFormulario();
      await cargarProductos();
    } catch (error) {
      console.error("Error al enviar producto:", error);
      alert('Ocurrió un error al guardar el producto');
    }
  });
// Cargar productos desde la API
async function cargarProductos() {
    try {
        const res = await fetch(apiUrl);
        const productos = await res.json();
        const productTable = document.getElementById('productTable');
        productTable.innerHTML = '';

        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.descripcion}</td>
                <td>${producto.precio}</td>
                <td>${producto.stock}</td>
                <td>${producto.categoria}</td>
                <td>${producto.proveedor}</td>
                <td><img src="${producto.urlImagen.replace('../', '')}" width="50"></td>
                <td>
                    <button onclick="editarProducto(${producto.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="eliminar" onclick="eliminarProducto(${producto.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            productTable.appendChild(row);
        });

        destacarStockBajo();

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// -- Resalta filas con stock bajo (<= 2 unidades) --
function destacarStockBajo() {
  // Selecciona únicamente los <tr> dentro del <tbody> de la tabla
  const filas = document.querySelectorAll('#tabla-productos tbody tr');
  filas.forEach(fila => {
    // La columna 4 (índice 3) es donde muestras el stock
    const stockCell = fila.children[3];
    const stock = parseInt(stockCell.textContent, 10) || 0;
    if (stock <= 0) {
      fila.classList.add('low-stock');
    } else {
      fila.classList.remove('low-stock');
    }
  });
}


// Cargar producto en el formulario para editar
async function editarProducto(id) {
    try {
        const res = await fetch(`${apiUrl}`);
        const productos = await res.json();
        const producto = productos.find(p => p.id === id);

        document.getElementById('productId').value = producto.id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('categoria').value = producto.categoria_id;
        document.getElementById('proveedor').value = producto.proveedor_id;
    } catch (error) {
        console.error("Error al cargar producto para editar:", error);
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Seguro de eliminar este producto?')) return;
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    try {
      await fetch(`${apiUrl}/eliminar/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
      alert('Producto eliminado con éxito');
      cargarProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert('Ocurrió un error al eliminar el producto');
    }
  }
  

// Limpiar formulario después de agregar o editar
function limpiarFormulario() {
    document.getElementById('productId').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('proveedor').value = '';
    document.getElementById('imagen').value = '';
}

// Mostrar usuario
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
        const gestionUsuarios = document.getElementById('gestionUsuarios');
        if (gestionUsuarios) {
            gestionUsuarios.style.display = 'none';
        }
        
         // Bloquear opción en el menú lateral
      const usuariosMenu = document.querySelector('nav ul li a[href="dashboard.html"]');
      if (usuariosMenu) {
        usuariosMenu.style.display = 'none';
      }
    }
}

// Cerrar sesión
document.getElementById('logoutButton').addEventListener('click', async function() {
    try {
        const response = await fetch('http://localhost:4000/api/logout', { method: 'POST' });

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

document.getElementById("btnCategorias").addEventListener("click", () => {
    document.getElementById("modalCategorias").style.display = "block";
    cargarCategorias();
});

document.getElementById("btnProveedores").addEventListener("click", () => {
    document.getElementById("modalProveedores").style.display = "block";
    cargarProveedores();
});

function cerrarModal(id) {
    document.getElementById(id).style.display = "none";
}

document.getElementById("btnExportPDFProductos").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cargar imagen
    const img = new Image();
    img.src = "../imagenes/logo1.png"; // Tu ruta a la imagen
  
    img.onload = function () {
      // Cuando la imagen haya cargado, la dibujamos
      doc.addImage(img, 'PNG', 10, 5, 40, 20); 
      // (x:150, y:5, ancho:40, alto:20) puedes ajustar estos valores
  
      // Agregar título
    doc.text("Listado de Productos", 80, 30);
  
    doc.autoTable({
      html: '#tabla-productos',
      startY: 40,
      didParseCell: function (data) {
        if (data.cell.raw && data.cell.raw.classList.contains('no-export')) {
          data.cell.text = '';
        }
      }
    });
  
    doc.save("productos.pdf");
    };
  });
  
  document.getElementById("btnExportExcelProductos").addEventListener("click", () => {
    const originalTable = document.getElementById("tabla-productos");
    const clonedTable = originalTable.cloneNode(true);
  
    clonedTable.querySelectorAll(".no-export").forEach(el => el.remove());
  
    const wb = XLSX.utils.table_to_book(clonedTable, { sheet: "Productos" });
    XLSX.writeFile(wb, "productos.xlsx");
  });
  

  document.getElementById("btnExportPDFCategorias").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cargar imagen
    const img = new Image();
    img.src = "../imagenes/logo1.png"; // Tu ruta a la imagen
  
    img.onload = function () {
      // Cuando la imagen haya cargado, la dibujamos
      doc.addImage(img, 'PNG', 10, 5, 40, 20); 
      // (x:150, y:5, ancho:40, alto:20) puedes ajustar estos valores
  
      // Agregar título
    doc.text("Listado de Categorias", 80, 30);
  
    doc.autoTable({
      html: '#tablaCategorias',
      startY: 40,
      didParseCell: function (data) {
        if (data.cell.raw && data.cell.raw.classList.contains('no-export')) {
          data.cell.text = '';
        }
      }
    });
    doc.save("categorias.pdf");
  };
});

document.getElementById("btnExportPDFProveedores").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    // Cargar imagen
    const img = new Image();
    img.src = "../imagenes/logo1.png"; // Tu ruta a la imagen
  
    img.onload = function () {
      // Cuando la imagen haya cargado, la dibujamos
      doc.addImage(img, 'PNG', 10, 5, 40, 20); 
      // (x:150, y:5, ancho:40, alto:20) puedes ajustar estos valores
  
      // Agregar título
    doc.text("Listado de Proveedores", 80, 30);
  
    doc.autoTable({
      html: '#tablaProveedores',
      startY: 40,
      didParseCell: function (data) {
        if (data.cell.raw && data.cell.raw.classList.contains('no-export')) {
          data.cell.text = '';
        }
      }
    });
    doc.save("proveedores.pdf");
  };
});
