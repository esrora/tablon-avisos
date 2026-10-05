# Tablón de avisos del aula

Proyecto común de la asignatura de despliegue de aplicaciones (2º DAM).

La aplicación es deliberadamente trivial: publica avisos, los lista y los borra.
Lo que se aprende no es a programarla, sino a **desplegarla**: primero a mano
sobre máquinas preparadas, después con contenedores, después de forma
automática y por último en la nube.

## Componentes

| Carpeta | Qué es | Tecnología |
|---|---|---|
| `api/` | API REST | Node + Express |
| `web/` | Cliente web | HTML, CSS y JavaScript sin librerías |
| `cliente/` | Cliente de consola | Java 21 + Maven |
| `db/` | Estructura de la base de datos | PostgreSQL |

## Endpoints

```
GET    /api/avisos          lista de avisos
POST   /api/avisos          crea un aviso   (titulo y autor obligatorios)
DELETE /api/avisos/:id      borra un aviso
GET    /api/version         version, commit y entorno que estan corriendo
GET    /api/health          estado del servicio
```

`/api/version` es el endpoint más importante del curso. El cliente web pinta su
respuesta abajo del todo, así que **cada vez que se despliegue una versión nueva
se verá cambiar el número al recargar la página**. Es lo que hace visible el
despliegue.

## Arrancarlo a mano (bloque 1)

```bash
# 1. Base de datos
sudo -u postgres createuser tablon --pwprompt
sudo -u postgres createdb tablon --owner=tablon
sudo -u postgres psql -d tablon -f db/init.sql

# 2. API
cd api
cp .env.example .env        # y ajustar los valores
npm install
node --env-file=.env server.js

# 3. Cliente web
cd ../web                   # editar config.js con la URL de la API
python3 -m http.server 8080

# 4. Cliente de consola
cd ../cliente
mvn package
API_URL=http://localhost:3000 java -jar target/tablon-cliente.jar
```

## Configuración

Ni la API ni el cliente Java llevan una sola dirección escrita en el código.
Todo entra por variables de entorno. Esa decisión es la que permite que el mismo
artefacto funcione en desarrollo, en producción y en AWS sin recompilar.

| Variable | Dónde | Para qué |
|---|---|---|
| `PORT` | API | puerto de escucha |
| `ENTORNO` | API | texto que se muestra en `/api/version` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | API | conexión a PostgreSQL |
| `APP_VERSION`, `GIT_COMMIT` | API | los inyectará el pipeline |
| `MIN_CLIENT_VERSION` | API | versión mínima del cliente Java (bloque 6) |
| `FICHERO_AVERIA` | API | interruptor de avería para el simulacro |
| `API_URL` | cliente Java | contra qué servidor habla |

## Interruptor de avería

Para el simulacro de caída del bloque 4, basta con crear el fichero que indica
`FICHERO_AVERIA` (por defecto `/tmp/averia`). A partir de ese momento
`/api/health` devuelve 503 y salta la alerta del sistema de monitorización.
Se borra el fichero y el servicio vuelve.

```bash
touch /tmp/averia     # el servicio se declara enfermo
rm /tmp/averia        # y vuelve a estar sano
```

## Recorrido por bloques

| Tag | Estado del proyecto |
|---|---|
| `v0-manual` | lo que hay ahora: se despliega a mano sobre las VM de Proxmox |
| `v1-comandos` | los mismos servicios levantados con `docker run` |
| `v2-compose` | el stack completo en un `compose.yml`, con overrides de dev y prod |
| `v3-imagenes` | Dockerfile propio para API, web y cliente |
| `v4-multistage` | los tres Dockerfile optimizados en varias etapas |
| `v5-registro` | imágenes publicadas en Docker Hub |
| `v6-ci` | build y pruebas automáticas en cada push |
| `v7-cd` | despliegue automático al servidor del grupo |
| `v8-cloud` | variante desplegada en AWS |
| `v9-ota` | cliente Java con autoactualización |

Cada tag es un punto de rescate: un grupo que se descuelgue hace checkout del
tag anterior y se reengancha sin arrastrar un entorno roto.
