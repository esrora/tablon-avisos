package es.elcampico.tablon;

import com.fasterxml.jackson.databind.JsonNode;

import java.io.InputStream;
import java.util.List;
import java.util.Properties;
import java.util.Scanner;

/**
 * Cliente de consola del tablon de avisos.
 *
 * La URL de la API se toma de la variable de entorno API_URL. Si no existe,
 * se usa localhost. Igual que la API, el cliente no lleva ninguna direccion
 * escrita en el codigo.
 */
public class Cliente {

    private static final String VERSION = leerVersion();
    private static final Scanner teclado = new Scanner(System.in);

    public static void main(String[] args) {
        String urlBase = System.getenv().getOrDefault("API_URL", "http://localhost:3000");
        ApiTablon api = new ApiTablon(urlBase);

        System.out.println("Tablon de avisos - cliente de consola v" + VERSION);
        System.out.println("Conectando con " + urlBase);

        boolean salir = false;
        while (!salir) {
            mostrarMenu();
            String opcion = teclado.nextLine().trim();

            try {
                switch (opcion) {
                    case "1" -> listar(api);
                    case "2" -> crear(api);
                    case "3" -> version(api);
                    case "0" -> salir = true;
                    default -> System.out.println("Opcion no valida.");
                }
            } catch (Exception e) {
                System.out.println("No se ha podido contactar con la API: " + e.getMessage());
            }
        }

        System.out.println("Hasta luego.");
    }

    private static void mostrarMenu() {
        System.out.println();
        System.out.println("1) Listar avisos");
        System.out.println("2) Publicar un aviso");
        System.out.println("3) Ver version del servidor");
        System.out.println("0) Salir");
        System.out.print("Opcion: ");
    }

    private static void listar(ApiTablon api) throws Exception {
        List<Aviso> avisos = api.listarAvisos();

        if (avisos.isEmpty()) {
            System.out.println("No hay avisos publicados.");
            return;
        }

        System.out.println();
        for (Aviso aviso : avisos) {
            System.out.println(aviso);
        }
    }

    private static void crear(ApiTablon api) throws Exception {
        System.out.print("Autor: ");
        String autor = teclado.nextLine();
        System.out.print("Titulo: ");
        String titulo = teclado.nextLine();
        System.out.print("Mensaje: ");
        String mensaje = teclado.nextLine();

        System.out.println(api.crearAviso(autor, titulo, mensaje));
    }

    private static void version(ApiTablon api) throws Exception {
        JsonNode datos = api.consultarVersion();
        System.out.println();
        System.out.println("Servidor : v" + datos.path("version").asText());
        System.out.println("Commit   : " + datos.path("commit").asText());
        System.out.println("Entorno  : " + datos.path("entorno").asText());
        System.out.println("Cliente  : v" + VERSION);
    }

    /** Lee la version que Maven ha inyectado en version.properties. */
    private static String leerVersion() {
        try (InputStream entrada = Cliente.class.getResourceAsStream("/version.properties")) {
            Properties propiedades = new Properties();
            propiedades.load(entrada);
            return propiedades.getProperty("version", "desconocida");
        } catch (Exception e) {
            return "desconocida";
        }
    }
}
