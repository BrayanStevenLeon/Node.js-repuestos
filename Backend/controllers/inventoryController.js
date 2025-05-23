const database = require("../src/database");
const path = require("path");
const cloudinary = require("../utils/cloudinary");
// Obtener productos
const getProducts = async (req, res) => {
  try {
    const connection = await database.getConnection();
    const sql = `
      SELECT 
        p.id, 
        p.nombre, 
        p.descripcion, 
        p.urlImagen, 
        p.precio, 
        p.stock, 
        c.nombre AS categoria, 
        pr.nombre AS proveedor
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      INNER JOIN proveedores pr ON p.proveedor_id = pr.id;
    `;

    const [result] = await connection.query(sql);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al obtener productos");
  }
};

// Agregar producto
const addProduct = async (req, res) => {
  try {
    const connection = await database.getConnection();
    const {
      nombre, descripcion, precio, stock,
      categoria_id, proveedor_id, usuario_id, urlImagen: urlBody
    } = req.body;

    // ✅ Usa la URL desde el body o, como fallback, la de multer (req.file.path)
    const urlImagen = urlBody || (req.file ? req.file.path : null);

    const [result] = await connection.query(
      `INSERT INTO productos 
         (nombre, descripcion, urlImagen, precio, stock, categoria_id, proveedor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, urlImagen, precio, stock, categoria_id, proveedor_id]
    );

    const newProductId = result.insertId;

    if (usuario_id) {
      const descripcionLog = `Se creó el producto ID ${newProductId}: ${nombre}`;
      await connection.query(
        `INSERT INTO logs_actividad (usuario_id, producto_id, accion, descripcion)
         VALUES (?, ?, 'creación', ?)`,
        [usuario_id, newProductId, descripcionLog]
      );
    }

    res.status(201).send("Producto agregado con éxito");
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).send("Error al agregar producto");
  }
};

// Editar producto
const updateProduct = async (req, res) => {
  try {
    const connection = await database.getConnection();
    const {
      nombre,
      descripcion,
      precio,
      stock,
      categoria_id,
      proveedor_id,
      usuario_id,
      urlImagen: urlFromBody // <-- URL enviada desde el front
    } = req.body;
    const id = req.params.id;

    // 1) Determinar la URL definitiva de la imagen:
    let urlImagen = urlFromBody || null;

    // 2) Si llega un archivo (req.file), subirlo y usar su URL:
    if (!urlImagen && req.file) {
      // ejemplo con Cloudinary SDK
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "productos"
      });
      urlImagen = result.secure_url;
    }

    // 3) Construir la consulta según si hay o no nueva URL:
    const sql = urlImagen
      ? `UPDATE productos
         SET nombre=?, descripcion=?, urlImagen=?, precio=?, stock=?, categoria_id=?, proveedor_id=?
         WHERE id=?`
      : `UPDATE productos
         SET nombre=?, descripcion=?, precio=?, stock=?, categoria_id=?, proveedor_id=?
         WHERE id=?`;

    const params = urlImagen
      ? [nombre, descripcion, urlImagen, precio, stock, categoria_id, proveedor_id, id]
      : [nombre, descripcion, precio, stock, categoria_id, proveedor_id, id];

    await connection.query(sql, params);

    // 4) Registrar en logs_actividad
    if (usuario_id) {
      const descripcionLog = `El producto con ID ${id} fue actualizado: ${nombre}`;
      await connection.query(
        `INSERT INTO logs_actividad (usuario_id, producto_id, accion, descripcion)
         VALUES (?, ?, 'actualización', ?)`,
        [usuario_id, id, descripcionLog]
      );
    }

    res.status(200).send("Producto actualizado con éxito");
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).send("Error al actualizar producto");
  }
};


// Eliminar producto
const deleteProduct = async (req, res) => {
  try {
    const connection = await database.getConnection();
    const id = req.params.id;
    const { usuario_id } = req.body;

    // 1) Poner a NULL el producto_id de *todos* los logs existentes para este producto
    await connection.query(
      "UPDATE logs_actividad SET producto_id = NULL WHERE producto_id = ?",
      [id]
    );

    // 2) Ahora sí borra el producto
    await connection.query("DELETE FROM productos WHERE id = ?", [id]);

    // 3) Inserta tu log de eliminación (con producto_id NULL)
    if (usuario_id) {
      const descripcionLog = `Se eliminó el producto ID ${id}`;
      await connection.query(
        `INSERT INTO logs_actividad (usuario_id, producto_id, accion, descripcion)
         VALUES (?, NULL, 'eliminación', ?)`,
        [usuario_id, descripcionLog]
      );
    }

    res.status(200).send("Producto eliminado con éxito");
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).send("Error al eliminar producto");
  }
};


module.exports = { getProducts, addProduct, updateProduct, deleteProduct };
