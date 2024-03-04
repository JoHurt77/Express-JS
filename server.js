const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para registrar las solicitudes
app.use((req, res, next) => {
  console.log(`Recibida petición ${req.method} en ${req.originalUrl}`);
  next();
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error en el servidor");
});

// Middleware para validar datos de entrada para la inserción y actualización de alumnos
const validateAlumnoData = (req, res, next) => {
  const { nombre, apellidos, dni, telefono } = req.body;
  if (!nombre || !apellidos || !dni || !telefono) {
    return res.status(400).send("Faltan campos obligatorios");
  }
  next();
};

// Crear conexión a la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "daw",
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) throw err;
  console.log("Conexión a la base de datos establecida correctamente.");
});

// Ruta GET para obtener todos los alumnos
app.get("/alumnos", (req, res) => {
  let sql = "SELECT * FROM alumnos";
  db.query(sql, (err, result) => {
    if (err) {
      return next(err); // Pasar el error al siguiente middleware
    }
    res.send(result);
  });
});

// Ruta POST para insertar un nuevo alumno
app.post("/alumnos", validateAlumnoData, (req, res, next) => {
  let sql = "INSERT INTO alumnos SET ?";
  let alumno = {
    nombre: req.body.nombre,
    apellidos: req.body.apellidos,
    dni: req.body.dni,
    telefono: req.body.telefono,
  };
  db.query(sql, alumno, (err, result) => {
    if (err) {
      return next(err); // Pasar el error al siguiente middleware
    }
    res.send("Alumno añadido correctamente.");
  });
});

// Ruta PUT para actualizar un alumno
app.put("/alumnos/:dni", validateAlumnoData, (req, res, next) => {
  let sql = `UPDATE alumnos SET nombre='${req.body.nombre}', apellidos='${req.body.apellidos}', telefono='${req.body.telefono}' WHERE dni='${req.params.dni}'`;
  db.query(sql, (err, result) => {
    if (err) {
      return next(err); // Pasar el error al siguiente middleware
    }
    res.send("Alumno actualizado correctamente.");
  });
});

// Ruta DELETE para eliminar un alumno
app.delete("/alumnos/:dni", (req, res, next) => {
  let sql = `DELETE FROM alumnos WHERE dni='${req.params.dni}'`;
  db.query(sql, (err, result) => {
    if (err) {
      return next(err); // Pasar el error al siguiente middleware
    }
    res.send("Alumno eliminado correctamente.");
  });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log("Servidor iniciado en el puerto 3000");
});
