import { EntityManager } from 'typeorm';

export interface ITransactionableRepository {
  withTX(em: EntityManager): this;
}
