import migrationRunner from 'node-pg-migrate'
import { join } from 'node:path'
import database from 'infra/database';
import { error } from 'node:console';

export default async function migrations (request, response) {

  const dbClient = await database.getNewClient();
  try {
    const allowedMethods = ['GET', 'POST'];

    if (!allowedMethods.includes(request.method)) {
      response.status(405).json(
        {
          message: `Method ${request.method} Not Allowed`
        }
      )
    }

    const defaultMigrationsOptions = {
        dbClient: dbClient,
        dryRun: true,
        dir: join('infra', 'migrations'),
        direction: 'up',
        verbose: true,
        migrationsTable: 'pgmigrations'
      }

    if (request.method === 'GET') {
      const pendingMigrations = await migrationRunner(defaultMigrationsOptions);
      response.status(200).json(pendingMigrations);
    }

    if (request.method === 'POST') {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: false
      });

      if (migratedMigrations.length > 0) {
        response.status(201).json(migratedMigrations);
      }
    
      response.status(200).json(migratedMigrations);
    }
  } catch (e) {
    console.error('ERRO: ', e)
    throw error;
  } finally {
    await dbClient.end();
  }
}