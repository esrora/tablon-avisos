// API del tablon de avisos del aula.
// Cinco endpoints, sin framework de rutas ni capas. Lo importante de esta
// asignatura no es esta aplicacion, sino como se despliega.

const fs = require('fs');
const express = require('express');
const { pool, esperarBaseDeDatos } = require('./db');

const app = express();
app.use(express.json());

// --- Configuracion: todo por variables de entorno ---------------------------

const PUERTO = Number(process.env.PORT || 3000);
const VERSION = process.env.APP_VERSION || '0.0.0-dev';
const COMMIT = process.env.GIT_COMMIT || 'sin-commit';
const MIN_CLIENTE = process.env.MIN_CLIENT_VERSION || '0.0.0';
const ENTORNO = process.env.ENTORNO || 'desarrollo';
// Interruptor de averia para el simulacro de caida del bloque 4.
const FICHERO_AVERIA = process.env.FICHERO_AVERIA || '/tmp/averia';

// Permitimos peticiones desde cualquier origen porque el cliente web se sirve
// desde otro puerto (y mas adelante desde otro dominio).
app.use((peticion, respuesta, siguiente) => {
  respuesta.header('Access-Control-Allow-Origin', '*');
  respuesta.header('Access-Control-Allow-Headers', 'Content-Type');
  respuesta.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (peticion.method === 'OPTIONS') return respuesta.sendStatus(204);
  siguiente();
});

// --- Endpoints de control ---------------------------------------------------

// El endpoint mas importante del curso: dice que version esta corriendo.
app.get('/api/version', (peticion, respuesta) => {
  respuesta.json({
    version: VERSION,
    commit: COMMIT,
    entorno: ENTORNO,
    minClientVersion: MIN_CLIENTE,
  });
});

// Lo consultan Docker, Compose, Traefik y el sistema de monitorizacion.
app.get('/api/health', async (peticion, respuesta) => {
  if (fs.existsSync(FICHERO_AVERIA)) {
    return respuesta.status(503).json({ estado: 'averiado' });
  }
  try {
    await pool.query('SELECT 1');
    respuesta.json({ estado: 'ok' });
  } catch (error) {
    respuesta.status(503).json({ estado: 'sin base de datos' });
  }
});

// --- Endpoints de avisos ----------------------------------------------------

app.get('/api/avisos', async (peticion, respuesta) => {
  try {
    const resultado = await pool.query(
      'SELECT id, titulo, mensaje, autor, creado_en FROM avisos ORDER BY creado_en DESC'
    );
    respuesta.json(resultado.rows);
  } catch (error) {
    console.error(error);
    respuesta.status(500).json({ error: 'Error al consultar los avisos' });
  }
});

app.post('/api/avisos', async (peticion, respuesta) => {
  const { titulo, mensaje, autor } = peticion.body;

  if (!titulo || titulo.trim() === '') {
    return respuesta.status(400).json({ error: 'El titulo es obligatorio' });
  }
  if (!autor || autor.trim() === '') {
    return respuesta.status(400).json({ error: 'El autor es obligatorio' });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO avisos (titulo, mensaje, autor) VALUES ($1, $2, $3) RETURNING id, titulo, mensaje, autor, creado_en',
      [titulo.trim(), (mensaje || '').trim(), autor.trim()]
    );
    respuesta.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    respuesta.status(500).json({ error: 'Error al crear el aviso' });
  }
});

app.delete('/api/avisos/:id', async (peticion, respuesta) => {
  try {
    const resultado = await pool.query('DELETE FROM avisos WHERE id = $1', [peticion.params.id]);
    if (resultado.rowCount === 0) {
      return respuesta.status(404).json({ error: 'Aviso no encontrado' });
    }
    respuesta.status(204).send();
  } catch (error) {
    console.error(error);
    respuesta.status(500).json({ error: 'Error al borrar el aviso' });
  }
});

// --- Arranque ---------------------------------------------------------------

async function arrancar() {
  await esperarBaseDeDatos();
  app.listen(PUERTO, () => {
    console.log(`API del tablon escuchando en el puerto ${PUERTO}`);
    console.log(`Version ${VERSION} (${COMMIT}) en entorno ${ENTORNO}`);
  });
}

arrancar().catch((error) => {
  console.error('No se ha podido arrancar la API:', error.message);
  process.exit(1);
});
