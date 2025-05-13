const contenedorTarjetas = document.getElementById("productos-container");
const buscadorInput = document.getElementById("buscadorProductos");
const paginacionContainer = document.getElementById("paginacion");

let bicicletasOriginales = [];
let productosFiltrados = [];
let paginaActual = 1;
const productosPorPagina = 9;

function crearTarjetasProductosInicio(productos) {
    contenedorTarjetas.innerHTML = "";

    productos.forEach(producto => {
        const nuevaBicicleta = document.createElement("div");
        nuevaBicicleta.classList = "tarjeta-producto";
        nuevaBicicleta.innerHTML = `
            <img src="${producto.urlImagen}">
            <h3>${producto.nombre}</h3>
            <h3>${producto.descripcion}</h3>
            <p>$${producto.precio}</p>
            <button>Agregar al carrito</button>
        `;
        contenedorTarjetas.appendChild(nuevaBicicleta);

        nuevaBicicleta.querySelector("button").addEventListener("click", () => {
            agregarAlCarrito(producto);
        });
    });
}

function mostrarProductosPaginados(productos, pagina) {
    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);
    crearTarjetasProductosInicio(productosPagina);
    generarControlesPaginacion(productos.length, pagina);
}

function generarControlesPaginacion(totalProductos, paginaActual) {
    paginacionContainer.innerHTML = "";
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
        const boton = document.createElement("button");
        boton.innerText = i;
        if (i === paginaActual) {
            boton.classList.add("activo");
        }
        boton.addEventListener("click", () => {
            paginaActual = i;
            mostrarProductosPaginados(productosFiltrados, paginaActual);
        });
        paginacionContainer.appendChild(boton);
    }
}

function filtrarProductosPorNombre(texto) {
    const textoNormalizado = texto.toLowerCase();
    productosFiltrados = bicicletasOriginales.filter(bici =>
        bici.nombre.toLowerCase().includes(textoNormalizado)
    );
    paginaActual = 1;
    mostrarProductosPaginados(productosFiltrados, paginaActual);
}

buscadorInput.addEventListener("input", (e) => {
    filtrarProductosPorNombre(e.target.value);
});

getBicicletas().then(bicicletas => {
    bicicletasOriginales = bicicletas;
    productosFiltrados = bicicletas; // Al principio, sin filtro
    mostrarProductosPaginados(productosFiltrados, paginaActual);
});
