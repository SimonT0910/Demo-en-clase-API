// Recibe las peticiones HTTP, valida datos y llama al servicio; aquí definimos la lógica de los ENDPOINTS para productos

const service = require('../services/productos');

// Aquí llama al servicio para leer los productos y los regresa como un JSON
const obtenerTodos = (req, res) => {
  const productos = service.leer();
  res.json(productos);
};

// Busca el producto por el ID; si no lo encuentra, tira un error 404
const obtenerPorId = (req, res) => {
  const productos = service.leer();
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado', id });
  }
  res.json(producto);
};

// Valida que el nombre y el precio existan en el cuerpo de la petición para crear un nuevo producto; si faltan datos, tira un error 400
const crear = (req, res) => {
  const { nombre, precio, disponible } = req.body;

  // En caso de que no exista el nombre o el precio generamos un error 400
  if (!nombre || !precio) {
    return res.status(400).json({ error: 'nombre y precio son obligatorios' });
  }

  const productos = service.leer();
  // Genera un ID autoincremental seguro buscando el ID más alto actual y sumándole 1
  const nuevo = {
    id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
    nombre,
    precio,
    disponible: disponible !== undefined ? disponible : true
  };

  productos.push(nuevo);
  service.guardar(productos); // Persiste el nuevo producto en el almacenamiento a través del servicio
  res.status(201).json(nuevo); // Responde con un estado 201 (Creado) y el objeto del nuevo producto
};

// Busca el producto por ID para actualizar sus datos; valida que los nuevos campos sean correctos y tira 404 si el producto no existe
const actualizar = (req, res) => {
  const productos = service.leer();
  const id = parseInt(req.params.id);
  const indice = productos.findIndex(p => p.id === id);

  // Si el índice es -1 significa que el ID solicitado no existe en la base de datos
  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const { nombre, precio, disponible } = req.body;

  // Valida que los datos obligatorios sigan viniendo en la petición de actualización
  if (!nombre || !precio) {
    return res.status(400).json({ error: 'nombre y precio son obligatorios' });
  }

  // Reemplaza el producto viejo con los nuevos datos manteniendo el mismo ID
  productos[indice] = { id, nombre, precio, disponible };
  service.guardar(productos);
  res.json(productos[indice]);
};

// Busca el producto por su ID y lo remueve del arreglo; si no existe, tira un error 404
const eliminar = (req, res) => {
  const productos = service.leer();
  const id = parseInt(req.params.id);
  const indice = productos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Remueve el elemento del arreglo usando su índice
  productos.splice(indice, 1);
  service.guardar(productos);
  res.status(204).send(); // Responde con un estado 204 (Sin contenido), confirmando que el borrado fue exitoso
};

// Exporta todas las funciones del controlador para que puedan ser mapeadas a las rutas correspondientes
module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };