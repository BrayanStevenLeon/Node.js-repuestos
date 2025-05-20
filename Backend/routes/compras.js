const express = require("express");
const router = express.Router();
const { registrarCompra } = require("../controllers/comprasController");

router.post("/", registrarCompra);

module.exports = router;
