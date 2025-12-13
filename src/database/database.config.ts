import { DataSource, DataSourceOptions } from 'typeorm';

export const SQLITE_CONFIG: DataSourceOptions = {
  type: 'sqlite',
  database: './db/unitblack.db',
  entities: [`${__dirname}/entities/**/*.entity{.ts,.js}`],
  synchronize: false,
};

// for migration config
const MIGRATION_DATASOURCE = new DataSource({
  ...SQLITE_CONFIG,
  migrations: [`${__dirname}/migrations/**/{*.ts,*.js}`],
  migrationsRun: false,
});

export default MIGRATION_DATASOURCE;
