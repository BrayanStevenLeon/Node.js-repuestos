const database = require('../src/database');

// Obtener todas las categorías
exports.obtenerCategorias = async (req, res) => {
    try {
        const connection = await database.getConnection();
        const [categorias] = await connection.query("SELECT * FROM categorias");
        res.json(categorias);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ message: "Error al obtener categorías", error });
    }
};

// Agregar categoría
exports.agregarCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body; 
        const connection = await database.getConnection();
        await connection.query("INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)", [nombre, descripcion]);
        res.status(201).json({ message: "Categoría agregada correctamente" });
    } catch (error) {
        console.error("Error al agregar categoría:", error);
        res.status(500).json({ message: "Error al agregar categoría", error });
    }
};

// Editar categoría
exports.editarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;  // Asegúrate de recibir la descripción
        const connection = await database.getConnection();
        await connection.query(
            "UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?", 
            [nombre, descripcion, id]
        );
        res.json({ message: "Categoría actualizada correctamente" });
    } catch (error) {
        console.error("Error al editar categoría:", error);
        res.status(500).json({ message: "Error al editar categoría", error });
    }
};


// Eliminar categoría
exports.eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await database.getConnection();
        await connection.query("DELETE FROM categorias WHERE id = ?", [id]);
        res.json({ message: "Categoría eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar categoría:", error);
        res.status(500).json({ message: "Error al eliminar categoría", error });
    }
};