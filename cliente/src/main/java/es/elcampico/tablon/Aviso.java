package es.elcampico.tablon;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Un aviso del tablon, tal y como lo devuelve la API.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Aviso {

    public int id;
    public String titulo;
    public String mensaje;
    public String autor;
    public String creado_en;

    @Override
    public String toString() {
        return "[" + id + "] " + titulo + "\n"
             + "    " + mensaje + "\n"
             + "    " + autor + " - " + creado_en;
    }
}
