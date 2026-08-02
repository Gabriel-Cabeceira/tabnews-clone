import { Client } from "pg";

async function query(queryObject) {

  let client;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (e) {
    console.error('ERRO: ', e);
    throw e;
  } finally {
    await client.end();
  }

}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: getSSLValues()
  });

  await client.connect();
  return client;
}

export default {
  query,
  getNewClient
}

function getSSLValues() {
  if (process.env.POSGRES_CA) {
    return {
      ca:process.env.POSGRES_CA
    }
  }


  
  return process.env.NODE_ENV === 'production' ? true : false;
}