import database from "infra/database.js";

async function status (request, response) {

    const updatedAt = new Date().toISOString();
    const databaseVersion = await database.query('SHOW server_version;');
    const databaseVersionValue = databaseVersion.rows[0].server_version;

    const dataBaseMaxConnections = await database.query('SHOW max_connections;');
    const maxConectionsValue = parseInt(dataBaseMaxConnections.rows[0].max_connections);

    const databaseName = process.env.POSTGRES_DB;
    const openedConnections = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName]
    });
    const openedConnectionsValue = openedConnections.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          // status: 'teste',
          max_connections: maxConectionsValue,
          opened_connections: openedConnectionsValue,
          // latency: {
          //   first_query: 1,
          //   second_query: 2,
          //   third_query: 3
          // },
          version: databaseVersionValue
        }
      }
    });
}

export default status;