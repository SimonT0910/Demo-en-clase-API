const service = require('../services/productos');

const obtenerTodos = (req, res) => {
  const productos = service.leer();
  res.json(productos);
};

const obtenerPorId = (req, res) => {
  const productos = service.leer();
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado', id });
  }
  res.json(producto);
};

const crear = (req, res) => {
  const { nombre, precio, disponible } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: 'nombre y precio son obligatorios' });
  }

  const productos = service.leer();
  const nuevo = {
    id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
    nombre,
    precio,
    disponible: disponible !== undefined ? disponible : true
  };

  productos.push(nuevo);
  service.guardar(productos);
  res.status(201).json(nuevo);
};

const actualizar = (req, res) => {
  const productos = service.leer();
  const id = parseInt(req.params.id);
  const indice = productos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const { nombre, precio, disponible } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: 'nombre y precio son obligatorios' });
  }

  productos[indice] = { id, nombre, precio, disponible };
  service.guardar(productos);
  res.json(productos[indice]);
};

const eliminar = (req, res) => {
  const productos = service.leer();
  const id = parseInt(req.params.id);
  const indice = productos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  productos.splice(indice, 1);
  service.guardar(productos);
  res.status(204).send();
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };