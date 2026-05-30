const app  = require('./app');
const PORT = process.env.PORT || 3000;

// Arranca servidor en el puerto local

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});