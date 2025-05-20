const { getConnection } = require('../src/database'); 
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {  
    try {
        const { email, contraseña } = req.body;
        console.log("Email recibido:", email);
        console.log("Contraseña recibida:", contraseña);

        const sql = 'SELECT * FROM usuarios WHERE email = ?';

        const connection = await getConnection(); 
        const [results] = await connection.execute(sql, [email]); 

        console.log("Resultados de la BD:", results);

        if (results.length === 0) {
            console.log("Usuario no encontrado.");
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];

        console.log("Contraseña en BD:", user.contraseña);

        const validPassword = await bcrypt.compare(contraseña, user.contraseña);
        console.log("Texto plano ingresado:", contraseña);
        console.log("Hash en BD:", user.contraseña);
        console.log("Nuevo hash generado:", await bcrypt.hash(contraseña, 10)); 
        console.log("¿Las contraseñas coinciden?", validPassword);

        if (!validPassword) {
            console.log("Contraseña incorrecta.");
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        req.session.user = {
            id: user.id,
            nombre: user.nombre,
            rol: user.rol
        };

        console.log("Datos enviados al frontend:", { message: 'Login exitoso', user: req.session.user });
        res.json({ message: 'Login exitoso', user: req.session.user });

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.verificarSesion = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    res.json({ user: req.session.user });
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
        res.json({ message: 'Sesión cerrada correctamente' });
    });
};

