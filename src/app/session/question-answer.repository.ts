import { ITransactionableRepository } from '../common/transactionable.repository';
import { QuestionAnswer } from './session.schema';

export interface QuestionAnswerRepository extends ITransactionableRepository {
  hasSubmittedAnswer(sessionId: number, questionId: string): Promise<boolean>;

  submitAnswer(
    sessionId: number,
    questionAnswer: QuestionAnswer,
  ): Promise<void>;

  getQuestionAnswers(sessionId: number): Promise<QuestionAnswer[]>;
}

export const SQL_QUESTION_ANSWER_REPOSITORY = 'SQL_QUESTION_ANSWER_REPOSITORY';
