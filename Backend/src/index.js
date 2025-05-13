require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const database = require("./database");
const session = require('express-session');
const cors = require('cors');
const path = require("path");
const helmet = require('helmet');

//rutas
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const inventoryRoutes = require('../routes/inventoryRoutes');
const categoriasRoutes = require('../routes/categorias');
const proveedoresRoutes = require('../routes/proveedores');
const comprasRoutes = require('../routes/compras');
const ventasRoutes = require('../routes/ventas');
const reportesRoutes = require('../routes/reportes');


//configuracion inicial

const app = express();

//configurar puerto
app.set("port", process.env.PORT || 4000);

app.use(helmet());

// CORS
const corsOptions = {
    origin: [
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5501",
        "https://nodejs-repuestos-production.up.railway.app"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Redirigir todo HTTP a HTTPS en producción (excepto preflight)
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const proto = req.headers['x-forwarded-proto'] || req.protocol;

  // Solo redirigir si:
  // - Está en producción
  // - No es un OPTIONS (preflight)
  // - No se usa HTTPS
  if (isProduction && proto !== 'https' && req.method !== 'OPTIONS') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  next();
});

// Configurar sesiones
app.use(session({
    secret: 'mi_secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
       secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' 
    }
}));

//middlewares

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use("/imagenes", express.static(path.join(__dirname, "../imagenes")));
app.use('/facturas', express.static(path.join(__dirname, '../public/facturas')));
app.use(
  '/reportes',
  express.static(path.join(__dirname, '..', 'reportes'))
);

//rutas
app.get("/productos", async (req, res) =>{
    const connection = await database.getConnection();
    const [result] = await connection.query("SELECT * FROM productos");
  
    res.json(result);
  
  });

  app.use('/api', authRoutes);
  app.use('/api', userRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/inventory/categorias', categoriasRoutes);
  app.use('/api/inventory/proveedores', proveedoresRoutes);
  app.use('/api/compras', comprasRoutes);
  app.use('/api/ventas', ventasRoutes);
  app.use('/api/reportes', reportesRoutes);
  
  //Iniciar el servidor
  app.listen(app.get("port"));
  console.log("Escuchando comunicaciones al puerto" +app.get("port"));