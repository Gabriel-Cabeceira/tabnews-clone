test("GET to /api/v1/status should return 200", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status")
    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody.updated_at).toBeDefined();

    const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
    expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

    const version = responseBody.dependencies.database.version;
    expect(typeof version).toBe('string');

    const max_connections = responseBody.dependencies.database.max_connections;
    expect(typeof max_connections).toBe('number');

    const opened_connections = responseBody.dependencies.database.opened_connections;
    expect(typeof opened_connections).toBe('number');

    const openedConnections = responseBody.dependencies.database.opened_connections;
    expect(openedConnections).toEqual(1);
});

