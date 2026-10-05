// Unico punto donde se configura contra que API habla el cliente web.
//
// En el bloque 2 este fichero dejara de editarse a mano: lo generara el
// contenedor al arrancar a partir de una variable de entorno. Ese es el
// ejemplo mas claro de "un mismo artefacto, varios entornos".

const CONFIG = {
  API_URL: 'http://localhost:3000',
};
