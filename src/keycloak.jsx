import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8180',
  realm: 'stepzone',
  clientId: 'stepzone-web'
};

const keycloak = new Keycloak(keycloakConfig);

export const initAuthentication = (onAuthenticatedCallback) => {
  keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
  })
  .then((authenticated) => {
    if (authenticated) {
      console.log("User Authenticated successfully!");
      console.log("JWT Access Token: ", keycloak.token); 
    }
    onAuthenticatedCallback(authenticated);
  })
  .catch((err) => {
    console.error("Authentication initialization failed", err);
  });
};

export default keycloak;