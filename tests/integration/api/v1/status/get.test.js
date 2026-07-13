test("GET to /api/v1/status should return 200", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status")
    expect(response.status).toBe(200);
});

test("updated_at should be defined", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status")

    const responseBody = await response.json();
    expect(responseBody.updated_at).toBeDefined();
});

test("updated_at should be a valid value", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status")

    const responseBody = await response.json();
    const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
    expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
});

test("database version should be a string value", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status")

    const responseBody = await response.json();
    const version = responseBody.dependencies.database.version;
    expect(typeof version).toBe('string');
});

test("database max_connections should be an integer value", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status")

    const responseBody = await response.json();
    const max_connections = responseBody.dependencies.database.max_connections;
    expect(typeof max_connections).toBe('number');
});

test("database opened_connections should be an integer value", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status")

    const responseBody = await response.json();
    const opened_connections = responseBody.dependencies.database.opened_connections;
    expect(typeof opened_connections).toBe('number');
});

test("database opened_connections should be 1", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status")

    const responseBody = await response.json();
    const openedConnections = responseBody.dependencies.database.opened_connections;
    expect(openedConnections).toEqual(1);
});

