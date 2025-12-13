import { QuestionAnswer } from './session.schema';

export interface QuestionAnswerRepository {
  hasSubmittedAnswer(sessionId: number, questionId: string): Promise<boolean>;

  submitAnswer(
    sessionId: number,
    questionAnswer: QuestionAnswer,
  ): Promise<void>;

  getAnswers(sessionId: number): Promise<QuestionAnswer[]>;
}

export const SQL_QUESTION_ANSWER_REPOSITORY = 'SQL_QUESTION_ANSWER_REPOSITORY';
