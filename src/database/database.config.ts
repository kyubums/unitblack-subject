import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

export function getPostgresConfig(): PostgresConnectionOptions {
  const DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@0.0.0.0:5432/postgres';

  const MIGRATION_RUN = process.env.MIGRATION_RUN === 'true';

  return {
    type: 'postgres',
    url: DATABASE_URL,
    entities: [`${__dirname}/entities/**/*.entity{.ts,.js}`],
    migrations: [`${__dirname}/migrations/**/{*.ts,*.js}`],
    migrationsRun: MIGRATION_RUN,
    synchronize: false,
  };
}

// for migration config
export const POSTGRES_CONFIG = getPostgresConfig();
export default POSTGRES_CONFIG;
