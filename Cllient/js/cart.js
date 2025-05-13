const contenedorTarjetas = document.getElementById("productos-container");
const unidadesElement = document.getElementById("unidades");
const precioElement = document.getElementById("precio");
const carritoVacioElement = document.getElementById("carrito-vacio");
const totalesElement = document.getElementById("totales");
const reiniciarCarritoElement = document.getElementById("reiniciar");
const botonCompra = document.getElementById("boton_Compra");
const formCompra = document.getElementById("formCompra");

function crearTarjetasProductosInicio() {
  contenedorTarjetas.innerHTML = "";
  const productos = JSON.parse(localStorage.getItem("bicicletas"));
  console.log(productos);
  if (productos && productos.length > 0) {
    productos.forEach((producto) => {
      const nuevaBicicleta = document.createElement("div");
      nuevaBicicleta.classList = "tarjeta-producto";
      nuevaBicicleta.innerHTML = `
        <img src="${producto.urlImagen}">
        <h3>${producto.nombre}</h3>
        <p>$${producto.precio}</p>
        <div>
          <button>-</button>
          <span class="cantidad">${producto.cantidad}</span>
          <button>+</button>
        </div>
      `;
      contenedorTarjetas.appendChild(nuevaBicicleta);

      nuevaBicicleta
        .getElementsByTagName("button")[1]
        .addEventListener("click", (e) => {
          const cuentaElement = e.target.parentElement.getElementsByTagName("span")[0];
          cuentaElement.innerText = agregarAlCarrito(producto);
          actualizarTotales();
        });

      nuevaBicicleta
        .getElementsByTagName("button")[0]
        .addEventListener("click", (e) => {
          restarAlCarrito(producto);
          crearTarjetasProductosInicio();
          actualizarTotales();
          habilitarBotonCompra();
        });
    });
  }
}

function actualizarTotales() {
  const productos = JSON.parse(localStorage.getItem("bicicletas"));
  let unidades = 0;
  let precio = 0;
  if (productos && productos.length > 0) {
    productos.forEach((producto) => {
      unidades += producto.cantidad;
      precio += producto.precio * producto.cantidad;
    });
    unidadesElement.innerText = unidades;
    precioElement.innerText = precio;
  }
}

function revisarMensajeVacio() {
  const productos = JSON.parse(localStorage.getItem("bicicletas"));
  carritoVacioElement.classList.toggle("escondido", productos && productos.length > 0);
  totalesElement.classList.toggle("escondido", !(productos && productos.length > 0));
}

function reiniciarCarrito() {
  localStorage.removeItem("bicicletas");
  actualizarTotales();
  crearTarjetasProductosInicio();
  habilitarBotonCompra();
  revisarMensajeVacio();
  actualizarNumeroCarrito();
}

function habilitarBotonCompra() {
  const productos = JSON.parse(localStorage.getItem("bicicletas"));
  botonCompra.disabled = !(productos && productos.length > 0);
}

formCompra.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const contacto = document.getElementById("contacto").value;
  const direccion = document.getElementById("direccion").value;
  const metodoPago = document.getElementById("metodoPago").value;
  const carrito = JSON.parse(localStorage.getItem("bicicletas")) || [];

  let mensaje = "";
  if (metodoPago === "tarjeta") {
    mensaje = `
      <div class="pago-contenedor">
      <div class="pago-imagen">
        <img src="../imagenes/tarjeta.png" alt="Tarjeta de crédito">
      </div>
      <div class="pago-formulario">
        <h3>Pago con Tarjeta</h3>
        <label>Número de tarjeta:</label><input type="text"><br>
        <label>Nombre del titular:</label><input type="text"><br>
        <label>Fecha de expiración:</label><input type="text"><br>
        <label>CVV:</label><input type="text"><br>
        <button id="confirmarPagoTarjeta">Pagar con Tarjeta</button>
      </div>
    </div>
  `;
  } else if (metodoPago === "efectivo") {
    mensaje = `
      <p>Gracias por tu compra. Puedes pagar en efectivo al momento de la entrega.</p>
      <button id="confirmarPedido">Confirmar Pedido</button>
    `;
  } else if (metodoPago === "transferencia") {
    mensaje = `
      <p>Realiza tu transferencia a la cuenta: 1234567890 y envíanos el comprobante por correo.</p>
      <button id="confirmarPedido">Confirmar Pedido</button>
    `;
  }

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      ${mensaje}
      <button id="cerrarModal">Cerrar</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("cerrarModal").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  const confirmar = () => {
    const boton = e.target;
    boton.disabled = true;
    boton.innerText = "Procesando...";

    const datosPedido = {
      nombre,
      email,
      contacto,
      direccion,
      metodoPago,
      carrito
    };

    fetch("http://localhost:4000/api/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosPedido),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Respuesta del servidor:", data);
          alert("Compra registrada con éxito.");
        } else if (data.error) {
          alert("Error: " + data.error);  // <-- Aquí muestra el mensaje real del servidor
        } else {
          alert("Ocurrió un error inesperado al registrar la compra.");
        }
      })
      .catch((err) => {
        console.error("Error al enviar pedido:", err);
        alert("Hubo un problema al enviar tu pedido.");
        boton.disabled = false;
        boton.innerText = "Confirmar Pedido";
      })
      .finally(() => {
        localStorage.removeItem("bicicletas");
        document.body.removeChild(modal);
        location.reload();
      });
  };

  const botonConfirmarPedido = modal.querySelector("#confirmarPedido");
  if (botonConfirmarPedido) {
    botonConfirmarPedido.addEventListener("click", confirmar);
  }

  const botonConfirmarTarjeta = modal.querySelector("#confirmarPagoTarjeta");
  if (botonConfirmarTarjeta) {
    botonConfirmarTarjeta.addEventListener("click", confirmar);
  }
});

// Inicialización
crearTarjetasProductosInicio();
actualizarTotales();
revisarMensajeVacio();
habilitarBotonCompra();
reiniciarCarritoElement.addEventListener("click", reiniciarCarrito);
