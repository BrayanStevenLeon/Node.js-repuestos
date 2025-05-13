const { getConnection } = require('../src/database');
const bcrypt = require('bcryptjs');


// Crear usuario
exports.createUser = async (req, res) => {
    const { nombre, email, contraseña, rol } = req.body;

    if (!nombre || !email || !contraseña || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const connection = await getConnection();
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const sql = 'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)';
        await connection.execute(sql, [nombre, email, hashedPassword, rol]);

        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Obtener usuarios
exports.getUsers = async (req, res) => {
    try {
        const connection = await getConnection();
        const [results] = await connection.execute('SELECT id, nombre, email, rol, fecha_creacion FROM usuarios');
        res.json(results);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// Editar usuario
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol, contraseña } = req.body;

    try {
        const connection = await getConnection();

        let sql = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?';
        const params = [nombre, email, rol];

        // Si el campo contraseña viene en la solicitud y no está vacío, lo actualizamos
        if (contraseña && contraseña.trim() !== '') {
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            sql += ', contraseña = ?';
            params.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await connection.execute(sql, params);

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await getConnection();

        const [result] = await connection.execute('SELECT email FROM usuarios WHERE id = ?', [id]);
        const emailEliminado = result.length > 0 ? result[0].email : 'desconocido';

        const sql = 'DELETE FROM usuarios WHERE id = ?';
        await connection.execute(sql, [id]);

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};
