const fs   = require('fs');
const path = require('path');

const ruta = path.join(__dirname, '../data/productos.json');

const leer = () => {
  const contenido = fs.readFileSync(ruta, 'utf-8');
  return JSON.parse(contenido);
};

const guardar = (productos) => {
  fs.writeFileSync(ruta, JSON.stringify(productos, null, 2));
};

module.exports = { leer, guardar };