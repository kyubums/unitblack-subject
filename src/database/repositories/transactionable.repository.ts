import { ITransactionableRepository } from 'src/app/common/transactionable.repository';
import { EntityManager } from 'typeorm';

export class TransactionableRepository implements ITransactionableRepository {
  constructor(protected em: EntityManager) {}

  withTX(em: EntityManager): this {
    return new (this.constructor as any)(em);
  }
}
