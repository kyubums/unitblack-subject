import { DataSource, DataSourceOptions } from 'typeorm';

export const POSTGRES_CONFIG: DataSourceOptions = {
  type: 'postgres',
  url: 'postgres://postgres:postgres@0.0.0.0:5432/postgres',
  entities: [`${__dirname}/entities/**/*.entity{.ts,.js}`],
  synchronize: false,
};

// for migration config
const MIGRATION_DATASOURCE = new DataSource({
  ...POSTGRES_CONFIG,
  migrations: [`${__dirname}/migrations/**/{*.ts,*.js}`],
  migrationsRun: false,
});

export default MIGRATION_DATASOURCE;
