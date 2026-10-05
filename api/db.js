// Conexion a PostgreSQL.
//
// IMPORTANTE: aqui no hay ni un solo dato de conexion escrito en el codigo.
// Todo llega por variables de entorno. Esa es la razon de que la misma
// aplicacion pueda arrancar en la maquina de desarrollo, en la de produccion
// y mas adelante en la nube sin tocar una linea.

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'tablon',
  user: process.env.DB_USER || 'tablon',
  password: process.env.DB_PASSWORD || 'tablon',
});

// La base de datos puede tardar unos segundos en aceptar conexiones.
// Reintentamos en lugar de morir en el primer intento.
async function esperarBaseDeDatos(intentos = 10) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Base de datos disponible');
      return;
    } catch (error) {
      console.log(`Base de datos no disponible (intento ${i}/${intentos}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error('No se ha podido conectar con la base de datos');
}

module.exports = { pool, esperarBaseDeDatos };
