const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const dbPath = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Leer base de datos
function readDb() {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

// Escribir base de datos
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Asegurar que existe la colección users
const db = readDb();
if (!db.users) {
  db.users = [];
  writeDb(db);
}

// Helper para generar tokens simulados
function generateToken(user) {
  return `fake-jwt-token-${user.id}-${Date.now()}`;
}

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// POST /auth/register - Registro de usuarios
app.post('/auth/register', (req, res) => {
  const { email, password, nombre, apellido, telefono } = req.body;

  // Validar datos requeridos
  if (!email || !password || !nombre || !apellido) {
    return res.status(400).json({
      message: 'Email, password, nombre y apellido son requeridos'
    });
  }

  const currentDb = readDb();

  // Verificar si el usuario ya existe
  const existingUser = currentDb.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      message: 'El usuario ya existe'
    });
  }

  // Crear nuevo usuario
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    nombre,
    apellido,
    telefono: telefono || null,
    rol: 'USER',
    createdAt: new Date().toISOString()
  };

  currentDb.users.push(newUser);
  writeDb(currentDb);

  // No devolver la contraseña
  const { password: _, ...userWithoutPassword } = newUser;

  const token = generateToken(newUser);

  res.status(201).json({
    user: userWithoutPassword,
    token,
    expiresIn: 3600
  });
});

// POST /auth/login - Login de usuarios
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email y password son requeridos'
    });
  }

  const currentDb = readDb();
  const user = currentDb.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      message: 'Credenciales inválidas'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = generateToken(user);

  res.json({
    user: userWithoutPassword,
    token,
    expiresIn: 3600
  });
});

// POST /auth/logout
app.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

// POST /auth/refresh
app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: 'Refresh token es requerido'
    });
  }

  const mockUser = {
    id: '1',
    email: 'user@example.com',
    nombre: 'Usuario',
    apellido: 'Demo',
    rol: 'USER'
  };

  const token = generateToken(mockUser);

  res.json({
    user: mockUser,
    token,
    expiresIn: 3600
  });
});

// POST /auth/password-reset-request
app.post('/auth/password-reset-request', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: 'Email es requerido'
    });
  }

  res.json({
    message: 'Si el email existe, se enviará un enlace de recuperación'
  });
});

// POST /auth/password-reset
app.post('/auth/password-reset', (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      message: 'Token y nueva contraseña son requeridos'
    });
  }

  res.json({
    message: 'Contraseña actualizada exitosamente'
  });
});

// POST /auth/change-password
app.post('/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: 'Contraseña actual y nueva contraseña son requeridas'
    });
  }

  res.json({
    message: 'Contraseña cambiada exitosamente'
  });
});

// ============================================
// RUTAS REST GENÉRICAS (productos, movimientos, etc.)
// ============================================

// GET /productos
app.get('/productos', (req, res) => {
  const db = readDb();
  res.json(db.productos || []);
});

// GET /productos/:id
app.get('/productos/:id', (req, res) => {
  const db = readDb();
  const producto = db.productos.find(p => p.id === req.params.id);

  if (!producto) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  res.json(producto);
});

// POST /productos
app.post('/productos', (req, res) => {
  const db = readDb();
  const newProducto = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    ...req.body
  };

  db.productos.push(newProducto);
  writeDb(db);

  res.status(201).json(newProducto);
});

// PUT /productos/:id
app.put('/productos/:id', (req, res) => {
  const db = readDb();
  const index = db.productos.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  db.productos[index] = { ...db.productos[index], ...req.body, id: req.params.id };
  writeDb(db);

  res.json(db.productos[index]);
});

// DELETE /productos/:id
app.delete('/productos/:id', (req, res) => {
  const db = readDb();
  const index = db.productos.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  db.productos.splice(index, 1);
  writeDb(db);

  res.status(204).send();
});

// GET /movimientos
app.get('/movimientos', (req, res) => {
  const db = readDb();
  res.json(db.movimientos || []);
});

// GET /movimientos/:id
app.get('/movimientos/:id', (req, res) => {
  const db = readDb();
  const movimiento = db.movimientos.find(m => m.id === req.params.id);

  if (!movimiento) {
    return res.status(404).json({ message: 'Movimiento no encontrado' });
  }

  res.json(movimiento);
});

// POST /movimientos
app.post('/movimientos', (req, res) => {
  const db = readDb();
  const newMovimiento = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    ...req.body
  };

  db.movimientos.push(newMovimiento);
  writeDb(db);

  res.status(201).json(newMovimiento);
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Servidor con Autenticación corriendo`);
  console.log(`========================================`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`\nEndpoints de Autenticación:`);
  console.log(`  POST http://localhost:${PORT}/auth/register`);
  console.log(`  POST http://localhost:${PORT}/auth/login`);
  console.log(`  POST http://localhost:${PORT}/auth/logout`);
  console.log(`  POST http://localhost:${PORT}/auth/refresh`);
  console.log(`\nEndpoints REST:`);
  console.log(`  GET    http://localhost:${PORT}/productos`);
  console.log(`  GET    http://localhost:${PORT}/productos/:id`);
  console.log(`  POST   http://localhost:${PORT}/productos`);
  console.log(`  PUT    http://localhost:${PORT}/productos/:id`);
  console.log(`  DELETE http://localhost:${PORT}/productos/:id`);
  console.log(`  GET    http://localhost:${PORT}/movimientos`);
  console.log(`========================================\n`);
});
