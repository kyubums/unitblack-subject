import { ITransactionableRepository } from '../common/transactionable.repository';
import { NewSession, Session } from './session.schema';

export interface SessionRepository extends ITransactionableRepository {
  createSession(newSession: NewSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | null>;
  updateSession(
    id: number,
    updateSession: Pick<Session, 'isCompleted' | 'nextQuestionId'>,
  ): Promise<Session>;
}

export const SQL_SESSION_REPOSITORY = 'SQL_SESSION_REPOSITORY';
