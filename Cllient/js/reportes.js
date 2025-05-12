document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario();
  cargarResumenEstadisticas();
  cargarVentasPorCategoria();
  cargarLogs();

   // Delegación de evento para cerrar log-cards
   document.getElementById('logs-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('close-log')) {
      const card = e.target.closest('.log-card');
      const logId = parseInt(card.getAttribute('data-log-id'));
      // Guardar ocultación en localStorage
      const hidden = JSON.parse(localStorage.getItem('hiddenLogs') || '[]');
      if (!hidden.includes(logId)) {
        hidden.push(logId);
        localStorage.setItem('hiddenLogs', JSON.stringify(hidden));
      }
      // Remover tarjeta
      card.remove();
    }
  });
});

document.getElementById('btnGenerarReporte').addEventListener('click', async () => {
    const tipo = document.getElementById('tipoReporte').value;

    // Obtener el usuario desde localStorage
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
        alert('No estás autenticado. Por favor, inicia sesión.');
        return;
    }

    const usuario = JSON.parse(usuarioGuardado);

    try {
        const response = await fetch('https://nodejs-repuestos-production.up.railway.app/api/reportes/generar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // por si usas cookies también
            body: JSON.stringify({ tipo, usuario })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            console.log('Archivo generado:', data.archivo);
            // Si quieres descargar el archivo automáticamente:
            // window.location.href = `/ruta/al/archivo/${data.archivo}`;
        } else {
            alert(data.message || 'Error al generar el reporte');
        }
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        alert('Error de red o del servidor');
    }
});

const API_BASE = 'https://nodejs-repuestos-production.up.railway.app';

async function abrirHistorialReportes() {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
  
      const response = await fetch("https://nodejs-repuestos-production.up.railway.app/api/reportes/historial");
      const data = await response.json();
  
      const reportes = data.reportes; // 👈 extraer del objeto
  
      if (!Array.isArray(reportes)) {
        console.error("La respuesta no es un array:", reportes);
        alert("No se pudo obtener el historial correctamente.");
        return;
      }
  
      const tbody = document.querySelector("#tablaHistorial tbody");
      tbody.innerHTML = "";
  
      reportes.sort((a, b) => a.id - b.id);

      reportes.forEach((reporte) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${reporte.id}</td>
          <td>${reporte.tipo}</td>
          <td>${new Date(reporte.fecha_generacion).toLocaleString()}</td>
          <td>
            <a href="${API_BASE}/reportes/${reporte.archivo}" target="_blank" id="icono" ><i class="fa-solid fa-download"></i></a>
          </td>
        `;
        tbody.appendChild(tr);
      });
  
      document.getElementById("modalHistorial").style.display = "block";
    } catch (error) {
      console.error("Error al abrir el historial de reportes:", error);
      alert("Error al obtener el historial de reportes");
    }
  }
  
  window.cerrarModal = function () {
    document.getElementById("modalHistorial").style.display = "none";
  };
  
  // mostrar usuario

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

      // Bloquear opción en el menú lateral
      const usuariosMenu = document.querySelector('nav ul li a[href="dashboard.html"]');
      if (usuariosMenu) {
        usuariosMenu.style.display = 'none';
      }

      // ocultar generar reportes
      const geneReportes = document.getElementById('reporte-contenedor');
      if (geneReportes) {
        geneReportes.style.display = 'none';
      }

      const gestionLogs = document.getElementById('logs-container');
      if (gestionLogs) {
          gestionLogs.style.display = 'none';
      }

  }
}

document.getElementById('logoutButton').addEventListener('click', async function () {
  try {
    const response = await fetch('https://nodejs-repuestos-production.up.railway.app/api/logout', { method: 'POST' });

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

async function cargarResumenEstadisticas() {
  try {
    const response = await fetch('https://nodejs-repuestos-production.up.railway.app/api/reportes/resumen'); // backend
    const data = await response.json();

    document.querySelector('#resumenVentas .valor').textContent = data.totalVentas;
    document.querySelector('#resumenUsuarios .valor').textContent = data.totalUsuarios;
    document.querySelector('#resumenProductos .valor').textContent = data.totalProductos;
  } catch (error) {
    console.error('Error al cargar resumen de estadísticas:', error);
  }
}

async function cargarGraficaVentasDia() {
  try {
    const response = await fetch("https://nodejs-repuestos-production.up.railway.app/api/reportes/ventas-por-dia");
    const data = await response.json();

    const fechas = data.map(item => item.fecha);
    const totales = data.map(item => item.total_ventas);

    const ctx = document.getElementById('graficaVentasDia').getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Ventas por día',
          data: totales,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

  } catch (error) {
    console.error("Error al cargar la gráfica de ventas:", error);
  }
}

cargarGraficaVentasDia();

async function cargarProductosMasVendidos() {
  const res = await fetch('https://nodejs-repuestos-production.up.railway.app/api/reportes/productos-mas-vendidos');
  const data = await res.json();

  const nombres = data.map(item => item.nombre);
  const cantidades = data.map(item => item.total_vendidos);

  const ctx = document.getElementById('graficaProductos').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: nombres,
      datasets: [{
        label: 'Cantidad vendida',
        data: cantidades,
        backgroundColor: 'rgba(62, 184, 38, 0.5)',
        borderColor: 'rgb(18, 231, 36)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

cargarProductosMasVendidos();

function cargarVentasPorCategoria() {
  fetch('https://nodejs-repuestos-production.up.railway.app/api/reportes/ventas-por-categoria')
    .then(res => res.json())
    .then(data => {
      const labels = data.map(item => item.categoria);
      const cantidades = data.map(item => item.total_vendido);

      const ctx = document.getElementById('graficaCategorias').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventas por categoría',
            data: cantidades,
            backgroundColor: [
              '#fcd34d',
              '#f87171',
              '#34d399',
              '#60a5fa',
              '#a78bfa',
              '#fb923c',
              '#f472b6'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });  
    });
}


  async function cargarGraficaEstadosPedidos() {
    try {
      const response = await fetch('https://nodejs-repuestos-production.up.railway.app/api/reportes/estados-pedidos');
      const data = await response.json();

      const ctx = document.getElementById('graficaEstadosPedidos').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: data.datasets
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: true,
              text: 'Estado de pedidos por día'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              stepSize: 1
            }
          }
        }
      });

    } catch (error) {
      console.error('Error al cargar la gráfica de estado de pedidos:', error);
    }
  }

  
  cargarGraficaEstadosPedidos();

// Función para cargar y mostrar logs, omitiendo los ocultados
async function cargarLogs() {
  const container = document.getElementById('logs-container');
  container.innerHTML = '';

  try {
    const [resProd, resVent] = await Promise.all([
      fetch('https://nodejs-repuestos-production.up.railway.app/api/reportes/logs-productos'),
      fetch('https://nodejs-repuestos-production.up.railway.app/api/reportes/logs-ventas')
    ]);
    const [logsProd, logsVent] = await Promise.all([resProd.json(), resVent.json()]);

    // Obtener lista de logs a ocultar
    const hidden = JSON.parse(localStorage.getItem('hiddenLogs') || '[]');

    // Combinar, filtrar ocultados y ordenar
    const todos = [...logsProd, ...logsVent]
      .filter(log => !hidden.includes(log.id))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Renderizar tarjetas
    todos.forEach(log => {
      const card = document.createElement('div');
      card.className = 'log-card';
      card.setAttribute('data-log-id', log.id);
      card.innerHTML = `
        
        <strong>${log.nombre_usuario}</strong> ${log.accion}<br>
        <em>${log.descripcion}</em><br>
        <small>${new Date(log.fecha).toLocaleString()}</small>
        <button class="close-log" title="Ocultar este log">&times;</button>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar logs:', error);
    container.innerHTML = '<p>Error al cargar los logs.</p>';
  }
}
