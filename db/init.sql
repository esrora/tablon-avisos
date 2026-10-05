-- Estructura de la base de datos del tablon de avisos.
-- Una sola tabla. No hay herramienta de migraciones: este fichero se ejecuta
-- a mano en el bloque 1 y lo ejecutara sola la imagen de PostgreSQL en el
-- bloque 2, al montarlo en /docker-entrypoint-initdb.d/

CREATE TABLE IF NOT EXISTS avisos (
    id         SERIAL PRIMARY KEY,
    titulo     VARCHAR(120) NOT NULL,
    mensaje    TEXT         NOT NULL DEFAULT '',
    autor      VARCHAR(80)  NOT NULL,
    creado_en  TIMESTAMP    NOT NULL DEFAULT NOW()
);

INSERT INTO avisos (titulo, mensaje, autor) VALUES
    ('Entrega del proyecto', 'Recordad subir el enlace al repositorio antes del viernes.', 'Esteban'),
    ('Aula 3 ocupada', 'El martes la clase se traslada al aula 5.', 'Jefatura'),
    ('Servidores del aula', 'Cada grupo trabaja siempre sobre el mismo servidor.', 'Esteban');
