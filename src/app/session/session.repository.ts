import { NewSession, QuestionAnswer, Session } from './session.schema';

export interface SessionRepository {
  createSession(newSession: NewSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | null>;
  updateSession(session: Session): Promise<Session>;
}

export const SQL_SESSION_REPOSITORY = 'SQL_SESSION_REPOSITORY';

export interface QuestionAnswerRepository {
  submitAnswer(
    sessionId: number,
    questionAnswer: QuestionAnswer,
  ): Promise<void>;
  getAnswers(sessionId: string): Promise<QuestionAnswer[]>;
}

export const SQL_QUESTION_ANSWER_REPOSITORY = 'SQL_QUESTION_ANSWER_REPOSITORY';
