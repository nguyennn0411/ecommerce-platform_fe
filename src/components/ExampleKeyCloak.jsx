import keycloak from "../keycloak";

const ExampleKeyCloak = () => {
    const token = keycloak.token;
    const id = keycloak.tokenParsed?.sub;
    const username = keycloak.tokenParsed?.preferred_username;
    const email = keycloak.tokenParsed?.email;
    const roles = keycloak.tokenParsed?.realm_access?.roles;

    const handleLogout = () => {
        keycloak.logout({
            redirectUri: window.location.origin
        });
    }

    return (
        <div>
            <h1>Example KeyCloak</h1>
            <h2>Read /components/ExampleKeyCloak to see how to retrieve these data.</h2>
            <p>Token: {token}</p>
            <p>ID: {id}</p>
            <p>Username: {username}</p>
            <p>Email: {email}</p>
            <p>Roles: {roles.join(', ')}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default ExampleKeyCloak;