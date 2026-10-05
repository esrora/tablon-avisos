// Cliente web del tablon de avisos. JavaScript sin librerias.

const API = CONFIG.API_URL;

const lista = document.getElementById('lista-avisos');
const cajaError = document.getElementById('error');
const estadoServidor = document.getElementById('estado-servidor');
const etiquetaVersion = document.getElementById('version');

function mostrarError(texto) {
  cajaError.textContent = texto;
  cajaError.hidden = !texto;
}

// Pinta la version que devuelve la API. Cuando el pipeline despliegue una
// version nueva, este texto cambiara solo al recargar la pagina.
async function cargarVersion() {
  try {
    const respuesta = await fetch(`${API}/api/version`);
    const datos = await respuesta.json();
    etiquetaVersion.textContent = `v${datos.version} · ${datos.commit} · ${datos.entorno}`;
    estadoServidor.textContent = 'API conectada';
  } catch (error) {
    etiquetaVersion.textContent = 'API no disponible';
    estadoServidor.textContent = 'No se ha podido contactar con la API';
  }
}

async function cargarAvisos() {
  try {
    const respuesta = await fetch(`${API}/api/avisos`);
    if (!respuesta.ok) throw new Error('respuesta no valida');
    const avisos = await respuesta.json();
    pintarAvisos(avisos);
    mostrarError('');
  } catch (error) {
    mostrarError('No se han podido cargar los avisos.');
  }
}

function pintarAvisos(avisos) {
  lista.innerHTML = '';

  if (avisos.length === 0) {
    const vacio = document.createElement('li');
    vacio.textContent = 'Todavía no hay avisos. Publica el primero.';
    lista.appendChild(vacio);
    return;
  }

  for (const aviso of avisos) {
    const elemento = document.createElement('li');

    const titulo = document.createElement('h3');
    titulo.textContent = aviso.titulo;

    const mensaje = document.createElement('p');
    mensaje.textContent = aviso.mensaje;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${aviso.autor} · ${new Date(aviso.creado_en).toLocaleString('es-ES')}`;

    const borrar = document.createElement('button');
    borrar.textContent = 'Borrar';
    borrar.addEventListener('click', () => borrarAviso(aviso.id));

    elemento.append(titulo, mensaje, meta, borrar);
    lista.appendChild(elemento);
  }
}

async function publicarAviso() {
  const autor = document.getElementById('autor').value;
  const titulo = document.getElementById('titulo').value;
  const mensaje = document.getElementById('mensaje').value;

  try {
    const respuesta = await fetch(`${API}/api/avisos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor, titulo, mensaje }),
    });

    if (!respuesta.ok) {
      const datos = await respuesta.json();
      mostrarError(datos.error || 'No se ha podido publicar el aviso.');
      return;
    }

    document.getElementById('titulo').value = '';
    document.getElementById('mensaje').value = '';
    mostrarError('');
    cargarAvisos();
  } catch (error) {
    mostrarError('No se ha podido contactar con la API.');
  }
}

async function borrarAviso(id) {
  try {
    await fetch(`${API}/api/avisos/${id}`, { method: 'DELETE' });
    cargarAvisos();
  } catch (error) {
    mostrarError('No se ha podido borrar el aviso.');
  }
}

document.getElementById('boton-publicar').addEventListener('click', publicarAviso);

cargarVersion();
cargarAvisos();
