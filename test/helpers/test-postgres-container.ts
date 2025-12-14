import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { getPostgresConfig } from 'src/database/database.config';

export class TestPostgresContainer {
  private container: StartedPostgreSqlContainer | null = null;
  private dataSource: DataSource | null = null;

  async start(): Promise<string> {
    if (this.container) {
      return this.container.getConnectionUri();
    }

    this.container = await new PostgreSqlContainer('postgres:18')
      .withDatabase('test')
      .withUsername('test')
      .withPassword('test')
      .start();

    return this.container.getConnectionUri();
  }

  getConnectionUri(): string {
    if (!this.container) {
      throw new Error('Container is not started. Call start() first.');
    }
    return this.container.getConnectionUri();
  }

  async runMigrations(): Promise<void> {
    if (!this.container) {
      throw new Error('Container is not started. Call start() first.');
    }

    const connectionUri = this.container.getConnectionUri();
    const config = getPostgresConfig();
    this.dataSource = new DataSource({
      ...config,
      url: connectionUri,
      migrationsRun: false, // 수동으로 실행하므로 false
    });

    await this.dataSource.initialize();
    await this.dataSource.runMigrations();
  }

  async stop(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
    }

    if (this.container) {
      await this.container.stop();
      this.container = null;
    }
  }
}
