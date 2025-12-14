import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@0.0.0.0:5432/postgres';

const MIGRATION_RUN = process.env.MIGRATION_RUN === 'true';

export const POSTGRES_CONFIG: PostgresConnectionOptions = {
  type: 'postgres',
  url: DATABASE_URL,
  entities: [`${__dirname}/entities/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/**/{*.ts,*.js}`],
  migrationsRun: MIGRATION_RUN,
  synchronize: false,
};

// for migration config
const MIGRATE_DATASOURCE = new DataSource(POSTGRES_CONFIG);
export default MIGRATE_DATASOURCE;
