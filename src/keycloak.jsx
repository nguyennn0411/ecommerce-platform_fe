import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8180',
  realm: 'stepzone',
  clientId: 'stepzone-web'
};

const keycloak = new Keycloak(keycloakConfig);

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toStableUuid(seed) {
  const source = seed && seed.trim() ? seed.trim() : 'stepzone-anonymous-user';
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const hex = [];
  for (let index = 0; index < 32; index += 1) {
    hash ^= index + source.charCodeAt(index % source.length);
    hash = Math.imul(hash, 16777619);
    hex.push(((hash >>> 0) & 15).toString(16));
  }

  hex[12] = '4';
  hex[16] = ((parseInt(hex[16], 16) & 3) | 8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
}

function normalizeProfile() {
  const tokenParsed = keycloak.tokenParsed ?? {};
  const rawUserId = tokenParsed.sub ?? tokenParsed.email ?? tokenParsed.preferred_username ?? '';
  const realmRoles = tokenParsed.realm_access?.roles ?? [];
  const clientRoles = tokenParsed.resource_access?.['stepzone-web']?.roles ?? [];

  return {
    authenticated: Boolean(keycloak.authenticated),
    token: keycloak.token ?? '',
    userId: isUuid(rawUserId) ? rawUserId : toStableUuid(rawUserId),
    email: tokenParsed.email ?? '',
    fullName: tokenParsed.name ?? '',
    firstName: tokenParsed.given_name ?? '',
    lastName: tokenParsed.family_name ?? '',
    username: tokenParsed.preferred_username ?? '',
    roles: [...new Set([...realmRoles, ...clientRoles])],
  };
}

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
    onAuthenticatedCallback(normalizeProfile());
  })
  .catch((err) => {
    console.error("Authentication initialization failed", err);
    onAuthenticatedCallback({
      authenticated: false,
      token: '',
      userId: '',
      email: '',
      fullName: '',
      firstName: '',
      lastName: '',
      username: '',
      roles: [],
    });
  });
};

export const login = () => keycloak.login();

export const loginWithGoogle = () =>
  keycloak.login({
    idpHint: 'google',
  });

export const logout = () =>
  keycloak.logout({
    redirectUri: window.location.origin,
  });

export const getCurrentProfile = () => normalizeProfile();

export default keycloak;
