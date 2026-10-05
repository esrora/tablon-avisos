package es.elcampico.tablon;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

/**
 * Todas las llamadas HTTP a la API del tablon.
 * Se usa el cliente HTTP que trae el propio JDK, sin librerias externas.
 */
public class ApiTablon {

    private final String urlBase;
    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper json = new ObjectMapper();

    public ApiTablon(String urlBase) {
        this.urlBase = urlBase;
    }

    /** GET /api/avisos */
    public List<Aviso> listarAvisos() throws Exception {
        HttpRequest peticion = HttpRequest.newBuilder()
                .uri(URI.create(urlBase + "/api/avisos"))
                .GET()
                .build();

        HttpResponse<String> respuesta = http.send(peticion, HttpResponse.BodyHandlers.ofString());

        if (respuesta.statusCode() != 200) {
            throw new RuntimeException("La API ha respondido " + respuesta.statusCode());
        }

        return json.readValue(respuesta.body(), json.getTypeFactory()
                .constructCollectionType(List.class, Aviso.class));
    }

    /** POST /api/avisos */
    public String crearAviso(String autor, String titulo, String mensaje) throws Exception {
        String cuerpo = json.writeValueAsString(
                Map.of("autor", autor, "titulo", titulo, "mensaje", mensaje));

        HttpRequest peticion = HttpRequest.newBuilder()
                .uri(URI.create(urlBase + "/api/avisos"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(cuerpo))
                .build();

        HttpResponse<String> respuesta = http.send(peticion, HttpResponse.BodyHandlers.ofString());

        if (respuesta.statusCode() == 201) {
            return "Aviso publicado correctamente.";
        }

        JsonNode error = json.readTree(respuesta.body());
        return "Error " + respuesta.statusCode() + ": " + error.path("error").asText("desconocido");
    }

    /** GET /api/version */
    public JsonNode consultarVersion() throws Exception {
        HttpRequest peticion = HttpRequest.newBuilder()
                .uri(URI.create(urlBase + "/api/version"))
                .GET()
                .build();

        HttpResponse<String> respuesta = http.send(peticion, HttpResponse.BodyHandlers.ofString());
        return json.readTree(respuesta.body());
    }
}
