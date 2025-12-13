import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository } from 'src/app/session/session.repository';
import {
  NewSession,
  Session,
  SessionSchema,
} from 'src/app/session/session.schema';
import { SessionEntity } from '../entities/session.entity';
import { EntityManager, Repository } from 'typeorm';
import { TransactionableRepository } from './transactionable.repository';

@Injectable()
export class SQLSessionRepository
  extends TransactionableRepository
  implements SessionRepository
{
  private readonly repository: Repository<SessionEntity>;

  constructor(protected em: EntityManager) {
    super(em);
    this.repository = em.getRepository(SessionEntity);
  }

  async createSession(newSession: NewSession): Promise<Session> {
    const sessionEntity = this.repository.create();
    sessionEntity.token = newSession.sessionToken;
    sessionEntity.surveyId = newSession.surveyId;
    sessionEntity.isCompleted = newSession.isCompleted;
    sessionEntity.nextQuestionId = newSession.nextQuestionId ?? undefined;

    await this.repository.save(sessionEntity);

    return mapSessionEntityToSession(sessionEntity);
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const sessionEntity = await this.repository.findOne({ where: { token } });

    if (!sessionEntity) {
      return null;
    }

    return mapSessionEntityToSession(sessionEntity);
  }

  // update session: isCompleted, nextQuestionId
  async updateSession(
    id: number,
    updateSession: Pick<Session, 'isCompleted' | 'nextQuestionId'>,
  ): Promise<Session> {
    const sessionEntity = await this.repository.findOne({
      where: { id },
    });

    if (!sessionEntity) {
      throw new NotFoundException(`Session not found`);
    }

    sessionEntity.isCompleted = updateSession.isCompleted;
    sessionEntity.nextQuestionId = updateSession.nextQuestionId ?? undefined;

    await this.repository.save(sessionEntity);

    return mapSessionEntityToSession(sessionEntity);
  }
}

function mapSessionEntityToSession(sessionEntity: SessionEntity): Session {
  return SessionSchema.parse({
    id: sessionEntity.id,
    uuid: sessionEntity.uuid,
    sessionToken: sessionEntity.token,
    surveyId: sessionEntity.surveyId,
    isCompleted: sessionEntity.isCompleted,
    nextQuestionId: sessionEntity.nextQuestionId,
  });
}
