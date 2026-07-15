import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8180',
  realm: 'stepzone',
  clientId: 'stepzone-web'
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;