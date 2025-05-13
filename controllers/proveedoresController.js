const database = require('../src/database');

// Obtener todos los proveedores
exports.obtenerProveedores = async (req, res) => {
    try {
        const connection = await database.getConnection();
        const [proveedores] = await connection.query("SELECT * FROM proveedores");
        res.json(proveedores);
    } catch (error) {
        console.error("Error al obtener proveedores:", error);
        res.status(500).json({ message: "Error al obtener proveedores", error });
    }
};

// Agregar proveedor
exports.agregarProveedor = async (req, res) => {
    try {
        const { nombre, contacto, telefono, email, direccion } = req.body;
        
        if (!nombre || !contacto || !telefono || !email || !direccion) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const connection = await database.getConnection();
        await connection.query(
            "INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)",
            [nombre, contacto, telefono, email, direccion]
        );

        res.status(201).json({ message: "Proveedor agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar proveedor:", error);
        res.status(500).json({ message: "Error al agregar proveedor", error });
    }
};

// Editar proveedor
exports.editarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, contacto, telefono, email, direccion } = req.body;

        if (!nombre || !contacto || !telefono || !email || !direccion) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const connection = await database.getConnection();
        await connection.query(
            "UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?",
            [nombre, contacto, telefono, email, direccion, id]
        );

        res.json({ message: "Proveedor actualizado correctamente" });
    } catch (error) {
        console.error("Error al editar proveedor:", error);
        res.status(500).json({ message: "Error al editar proveedor", error });
    }
};

// Eliminar proveedor
exports.eliminarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await database.getConnection();
        await connection.query("DELETE FROM proveedores WHERE id = ?", [id]);
        res.json({ message: "Proveedor eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar proveedor:", error);
        res.status(500).json({ message: "Error al eliminar proveedor", error });
    }
};
