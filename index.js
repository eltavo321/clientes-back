const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Variables de entorno
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'admin';
const DB_NAME = process.env.DB_NAME || 'clientes';

// Conexión a MySQL (con retry)
let db;

function connectDB() {
  db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  });

  db.connect(err => {
    if (err) {
      console.error('❌ Error conectando a MySQL:', err.message);
      console.log('🔁 Reintentando en 5 segundos...');
      setTimeout(connectDB, 5000);
    } else {
      console.log('✅ Conectado a MySQL');
    }
  });
}

connectDB();


// =========================
// 📦 ENDPOINTS CRUD
// =========================

// 🔍 Obtener todos
app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ➕ Crear cliente
app.post('/clientes', (req, res) => {
  const { nombre, apellidos, ciudad } = req.body;

  if (!nombre || !apellidos || !ciudad) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  db.query(
    'INSERT INTO clientes (nombre, apellidos, ciudad) VALUES (?, ?, ?)',
    [nombre, apellidos, ciudad],
    (err, result) => {
      if (err) return res.status(500).send(err);

      res.json({
        id: result.insertId,
        nombre,
        apellidos,
        ciudad
      });
    }
  );
});

// ✏️ Actualizar cliente
app.put('/clientes/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellidos, ciudad } = req.body;

  db.query(
    'UPDATE clientes SET nombre=?, apellidos=?, ciudad=? WHERE id=?',
    [nombre, apellidos, ciudad, id],
    (err) => {
      if (err) return res.status(500).send(err);

      res.json({
        id,
        nombre,
        apellidos,
        ciudad
      });
    }
  );
});

// 🗑️ Eliminar cliente
app.delete('/clientes/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM clientes WHERE id=?',
    [id],
    (err) => {
      if (err) return res.status(500).send(err);

      res.json({ message: 'Cliente eliminado' });
    }
  );
});


// =========================
// 🚀 SERVER
// =========================

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});