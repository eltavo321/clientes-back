const express = require('express');const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// variables de entorno
const dbConfig = {
  host: process.env.DB_HOST || "mysql-clientes",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "clientes"
};

let db;

// 🔁 conexión con reintento
function connectDB() {
  db = mysql.createConnection(dbConfig);

  db.connect(err => {
    if (err) {
      console.log("❌ Error conectando a MySQL:", err.message);
      console.log("🔁 Reintentando en 5 segundos...");
      setTimeout(connectDB, 5000);
    } else {
      console.log("✅ Conectado a MySQL");
    }
  });
}

connectDB();

// 📌 CRUD

app.get("/clientes", (req, res) => {
  db.query("SELECT * FROM clientes", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post("/clientes", (req, res) => {
  const { nombre, apellidos, ciudad } = req.body;
  db.query(
    "INSERT INTO clientes (nombre, apellidos, ciudad) VALUES (?, ?, ?)",
    [nombre, apellidos, ciudad],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Cliente agregado" });
    }
  );
});

app.put("/clientes/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, apellidos, ciudad } = req.body;

  db.query(
    "UPDATE clientes SET nombre=?, apellidos=?, ciudad=? WHERE id=?",
    [nombre, apellidos, ciudad, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Cliente actualizado" });
    }
  );
});

app.delete("/clientes/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM clientes WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Cliente eliminado" });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});