import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository } from 'src/app/session/session.repository';
import {
  NewSession,
  Session,
  SessionSchema,
} from 'src/app/session/session.schema';
import { SessionEntity } from '../entities/session.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class SQLSessionRepository implements SessionRepository {
  private readonly repository: Repository<SessionEntity>;

  constructor(protected em: EntityManager) {
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
  async updateSession(session: Session): Promise<Session> {
    const sessionEntity = await this.repository.findOne({
      where: { uuid: session.uuid },
    });

    if (!sessionEntity) {
      throw new NotFoundException(`Session ${session.uuid} not found`);
    }

    sessionEntity.isCompleted = session.isCompleted;
    sessionEntity.nextQuestionId = session.nextQuestionId ?? undefined;

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
