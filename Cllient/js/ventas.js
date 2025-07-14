// 1) Función de inicialización: valida sesión y luego muestra el módulo
async function initVentas() {
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) {
    document.body.innerHTML = '';
    alert('No has iniciado sesión');
    window.location.replace('login.html');
    return;
  }else{
    document.body.style.visibility = 'visible';
  }

  mostrarUsuario();

  // Configurar filtro por estado
  const filtro = document.getElementById('filtroEstadoPago');
  if (filtro) {
    filtro.addEventListener('change', cargarVentas);
  }

  cargarVentas();
}

// 2) Ejecutar tanto al cargar como al volver desde caché (botón Atrás)
window.addEventListener('DOMContentLoaded', initVentas);
window.addEventListener('pageshow', initVentas);

function cargarVentas() {
  const select = document.getElementById('filtroEstadoPago');
  const estadoSeleccionado = select ? select.value : 'todos';

  fetch('https://nodejs-repuestos-production.up.railway.app/api/ventas')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#tabla-ventas tbody');
      tbody.innerHTML = '';

      if (Array.isArray(data)) {
        // Filtrar según el estado seleccionado
        const ventasFiltradas = estadoSeleccionado === 'todos'
          ? data
          : data.filter(v => v.estado_pago === estadoSeleccionado);

        // Ordenar por ID ascendente
        ventasFiltradas.sort((a, b) => a.id - b.id);

        if (ventasFiltradas.length === 0) {
          const fila = document.createElement('tr');
          fila.innerHTML = `<td colspan="10">No hay ventas con ese estado.</td>`;
          tbody.appendChild(fila);
          return;
        }

        ventasFiltradas.forEach(venta => {
          const fila = document.createElement('tr');
          let botonAccion = '';

          if (venta.estado_pago === 'pendiente') {
            botonAccion = `
              <div style="display: flex; gap: 10px;">
                <button class="btn-pagar" data-id="${venta.id}" title="Marcar como pagado">
                  <i class="fa-solid fa-handshake-angle"></i>
                </button>
                <button class="btn-cancelar" data-id="${venta.id}" title="Cancelar venta">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            `;
          } else if (venta.estado_pago === 'pagado') {
            botonAccion = `
              <div style="display: flex; gap: 10px;">
                <a href="https://nodejs-repuestos-production.up.railway.app/${venta.factura_pdf}" target="_blank" download class="btn-descargar-factura" title="Descargar factura">
                  <i class="fa-solid fa-file-arrow-down"></i>
                </a>
              </div>
            `;
          }

          fila.innerHTML = `
            <td>${venta.id}</td>
            <td>${venta.nombre_cliente}</td>
            <td>${venta.email_cliente}</td>
            <td>${venta.direccion_envio}</td>
            <td>${venta.contacto}</td>
            <td>${venta.metodo_pago}</td>
            <td>${new Date(venta.fecha_compra).toLocaleString()}</td>
            <td>${venta.estado_pago}</td>
            <td>$${Number(venta.total).toFixed(2)}</td>
            <td>${botonAccion}
              <button class="btn-detalle" data-id="${venta.id}" title="Ver detalle de compra">
                <i class="fa-solid fa-eye"></i>
              </button>
            </td>
          `;

          tbody.appendChild(fila);
        });
      } else {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td colspan="10">Error al cargar datos.</td>`;
        tbody.appendChild(fila);
      }
    })
    .catch(error => {
      console.error('Error al obtener ventas:', error);
      const tbody = document.querySelector('#tabla-ventas tbody');
      tbody.innerHTML = `<tr><td colspan="10">Error al cargar datos.</td></tr>`;
    });
}

// Eventos globales de click para acciones de venta
document.addEventListener('click', async e => {
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) {
    alert('No has iniciado sesión');
    return;
  }
  const usuario = JSON.parse(usuarioStr);

  // Marcar como pagado
  if (e.target.closest('.btn-pagar')) {
    const idVenta = e.target.closest('.btn-pagar').dataset.id;
    try {
      const res = await fetch(`https://nodejs-repuestos-production.up.railway.app/api/ventas/pagar/${idVenta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
      if (res.ok) { alert("Estado actualizado a 'pagado'"); cargarVentas(); }
      else { const err = await res.json(); alert(err.mensaje || 'Error al actualizar'); }
    } catch { alert('Error de red al actualizar'); }
  }

  // Marcar como cancelado
  if (e.target.closest('.btn-cancelar')) {
    const idVenta = e.target.closest('.btn-cancelar').dataset.id;
    if (!confirm('¿Cancelar esta venta?')) return;
    try {
      const res = await fetch(`https://nodejs-repuestos-production.up.railway.app/api/ventas/cancelar/${idVenta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
      if (res.ok) { alert("Estado actualizado a 'cancelado'"); cargarVentas(); }
      else { const err = await res.json(); alert(err.mensaje || 'Error al cancelar'); }
    } catch { alert('Error de red al cancelar'); }
  }

  // Mostrar detalle
  if (e.target.closest('.btn-detalle')) {
    const idVenta = e.target.closest('.btn-detalle').dataset.id;
    try {
      const res = await fetch(`https://nodejs-repuestos-production.up.railway.app/api/ventas/detalle/${idVenta}`);
      const detalle = await res.json();
      if (res.ok) mostrarDetalleModal(detalle);
      else alert('Error al obtener detalle');
    } catch { console.error('Error al obtener detalle'); }
  }
});

// Cerrar sesión
function cerrarSesion() {
  fetch('https://nodejs-repuestos-production.up.railway.app/api/logout', { method: 'POST' })
    .then(r => {
      if (r.ok) { localStorage.removeItem('usuario'); location.replace('login.html'); }
      else alert('Error al cerrar sesión');
    }).catch(() => alert('Error al cerrar sesión'));
}

// Asignar evento a logout
const logoutBtn = document.getElementById('logoutButton');
if (logoutBtn) logoutBtn.addEventListener('click', cerrarSesion);

function mostrarUsuario() {
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) { alert('No has iniciado sesión'); window.location.href = 'login.html'; return; }
  const usuario = JSON.parse(usuarioStr);
  document.getElementById('nombreUsuario').textContent = usuario.nombre;
  document.getElementById('rolUsuario').textContent = usuario.rol;
   const usuariosMenu = document.getElementById('menuUsuarios');
    if (usuariosMenu) {
      usuariosMenu.style.display = 'none';
    }
}

function mostrarDetalleModal(detalle) {
  const modal = document.getElementById('modalDetalle');
  const tbody = modal.querySelector('#tablaDetalle tbody');
  tbody.innerHTML = '';
  detalle.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nombre_producto}</td>
      <td>${item.cantidad}</td>
      <td>$${Number(item.precio_unitario).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
  modal.style.display = 'block';
  document.getElementById('cerrarModalDetalle').onclick = () => modal.style.display = 'none';
}

// Botón PDF
document.getElementById("btnExportPDF").addEventListener("click", () => {
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
  doc.text("Listado de Ventas", 80, 30);

  doc.autoTable({
    html: '#tabla-ventas',
    startY: 40,
    columnStyles: {
      8: { cellWidth: 0 } 
    },
    didParseCell: function (data) {
      if (data.cell.raw && data.cell.raw.classList.contains('no-export')) {
        data.cell.text = ''; 
      }
    }
  });

  doc.save("ventas.pdf");
};
});

// Botón Excel
document.getElementById("btnExportExcel").addEventListener("click", () => {
  
  const originalTable = document.getElementById("tabla-ventas");
  const clonedTable = originalTable.cloneNode(true);

  clonedTable.querySelectorAll(".no-export").forEach(el => el.remove());

  const wb = XLSX.utils.table_to_book(clonedTable, { sheet: "Ventas" });
  XLSX.writeFile(wb, "ventas.xlsx");
});