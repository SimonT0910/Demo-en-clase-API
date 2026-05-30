const API = 'http://localhost:3000/api/productos';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatPrecio(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(valor);
}

function mostrarToast(mensaje, tipo = 'ok') {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.className = `toast toast--${tipo} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ── Cargar y renderizar productos ──────────────────────────────────────────

async function cargarProductos() {
  const estadoCarga = document.getElementById('estado-carga');
  const tablaWrapper = document.getElementById('tabla-wrapper');
  const contador = document.getElementById('contador-productos');

  estadoCarga.style.display = 'block';
  tablaWrapper.style.display = 'none';
  estadoCarga.textContent = 'Cargando productos...';

  try {
    const resp = await fetch(API);
    if (!resp.ok) throw new Error('Error al conectar con la API');
    const productos = await resp.json();

    contador.textContent = `${productos.length} producto${productos.length !== 1 ? 's' : ''}`;
    renderizarTabla(productos);

    estadoCarga.style.display = 'none';
    tablaWrapper.style.display = 'block';
  } catch (err) {
    estadoCarga.textContent = '⚠ No se pudo conectar con el servidor. ¿Está corriendo el backend?';
  }
}

function renderizarTabla(productos) {
  const tbody = document.getElementById('tabla-body');

  if (productos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem">No hay productos registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr data-id="${p.id}">
      <td class="id">#${p.id}</td>
      <td>${p.nombre}</td>
      <td class="precio">${formatPrecio(p.precio)}</td>
      <td><span class="chip chip--${p.disponible ? 'si' : 'no'}">${p.disponible ? 'En stock' : 'Agotado'}</span></td>
      <td class="acciones">
        <button class="btn btn--edit" onclick="abrirModal(${p.id}, '${p.nombre}', ${p.precio}, ${p.disponible})">✎ Editar</button>
        <button class="btn btn--danger" onclick="eliminarProducto(${p.id})">✕ Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// ── Agregar producto ───────────────────────────────────────────────────────

document.getElementById('form-producto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
  const disponible = document.getElementById('disponible').checked;

  if (!nombre || !precio) return;

  const btn = document.getElementById('btn-agregar');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Guardando...';

  try {
    const resp = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, precio, disponible })
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || 'Error al crear producto');
    }

    e.target.reset();
    document.getElementById('disponible').checked = true;
    mostrarToast('✓ Producto agregado correctamente', 'ok');
    cargarProductos();
  } catch (err) {
    mostrarToast(`✕ ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = '+ Agregar producto';
  }
});

// ── Eliminar producto ──────────────────────────────────────────────────────

async function eliminarProducto(id) {
  if (!confirm(`¿Eliminar el producto #${id}?`)) return;

  try {
    const resp = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (resp.status === 404) throw new Error('Producto no encontrado');
    if (!resp.ok) throw new Error('Error al eliminar');

    mostrarToast('✓ Producto eliminado', 'ok');
    cargarProductos();
  } catch (err) {
    mostrarToast(`✕ ${err.message}`, 'error');
  }
}

// ── Modal editar ───────────────────────────────────────────────────────────

function abrirModal(id, nombre, precio, disponible) {
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-nombre').value = nombre;
  document.getElementById('edit-precio').value = precio;
  document.getElementById('edit-disponible').checked = disponible;

  const modal = document.getElementById('modal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function cerrarModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('modal-close').addEventListener('click', cerrarModal);
document.getElementById('btn-cancelar').addEventListener('click', cerrarModal);
document.getElementById('modal-backdrop').addEventListener('click', cerrarModal);

document.getElementById('form-editar').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const nombre = document.getElementById('edit-nombre').value.trim();
  const precio = parseFloat(document.getElementById('edit-precio').value);
  const disponible = document.getElementById('edit-disponible').checked;

  if (!nombre || !precio) return;

  try {
    const resp = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, precio, disponible })
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || 'Error al actualizar');
    }

    cerrarModal();
    mostrarToast('✓ Producto actualizado', 'ok');
    cargarProductos();
  } catch (err) {
    mostrarToast(`✕ ${err.message}`, 'error');
  }
});

// ── Botón recargar ─────────────────────────────────────────────────────────

document.getElementById('btn-recargar').addEventListener('click', cargarProductos);

// ── Inicio ─────────────────────────────────────────────────────────────────

cargarProductos();