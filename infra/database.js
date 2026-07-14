import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: getSSLValues()
  });

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (e) {
    console.error('ERRO: ', e);
    throw e;
  } finally {
    await client.end();
  }

}

export default {
  query: query
}

function getSSLValues() {
  if (process.env.POSGRES_CA) {
    return {
      ca:process.env.POSGRES_CA
    }
  }
  
  return process.env.NODE_ENV === 'development' ? false : true;
}