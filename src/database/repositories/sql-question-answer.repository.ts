import { Injectable } from '@nestjs/common';
import { QuestionAnswerRepository } from 'src/app/session/question-answer.repository';
import { QuestionAnswer } from 'src/app/session/session.schema';
import { QuestionType } from 'src/app/survey/survey.schema';
import { EntityManager, Repository } from 'typeorm';
import { AnswerChoiceEntity } from '../entities/answer-choice.entity';
import { AnswerTextEntity } from '../entities/answer-text.entity';
import { QuestionAnswerEntity } from '../entities/question-answer.entity';

@Injectable()
export class SQLQuestionAnswerRepository implements QuestionAnswerRepository {
  private readonly repository: Repository<QuestionAnswerEntity>;
  private readonly answerChoiceRepository: Repository<AnswerChoiceEntity>;
  private readonly answerTextRepository: Repository<AnswerTextEntity>;

  constructor(protected em: EntityManager) {
    this.repository = em.getRepository(QuestionAnswerEntity);
    this.answerChoiceRepository = em.getRepository(AnswerChoiceEntity);
    this.answerTextRepository = em.getRepository(AnswerTextEntity);
  }

  async hasSubmittedAnswer(
    sessionId: number,
    questionId: string,
  ): Promise<boolean> {
    const exists = await this.repository.exists({
      where: { sessionId, questionId },
    });

    return exists;
  }

  async submitAnswer(
    sessionId: number,
    questionAnswer: QuestionAnswer,
  ): Promise<void> {
    const questionAnswerEntity = this.repository.create({
      sessionId,
      questionId: questionAnswer.questionId,
      submittedAt: questionAnswer.submittedAt,
    });

    await this.repository.save(questionAnswerEntity);

    if (questionAnswer.answer) {
      if (questionAnswer.answer.type === QuestionType.SingleChoice) {
        const answerChoiceEntity = this.answerChoiceRepository.create({
          questionAnswerId: questionAnswerEntity.id,
          optionId: questionAnswer.answer.optionId,
        });
        await this.answerChoiceRepository.save(answerChoiceEntity);
      } else if (questionAnswer.answer.type === QuestionType.MultiChoice) {
        const answerChoiceEntities = questionAnswer.answer.choices.map(
          ({ optionId }) => {
            return this.answerChoiceRepository.create({
              questionAnswerId: questionAnswerEntity.id,
              optionId,
            });
          },
        );
        await this.answerChoiceRepository.save(answerChoiceEntities);
      } else if (questionAnswer.answer.type === QuestionType.Text) {
        const answerTextEntity = this.answerTextRepository.create({
          questionAnswerId: questionAnswerEntity.id,
          text: questionAnswer.answer.text,
        });
        await this.answerTextRepository.save(answerTextEntity);
      }
    }
  }

  getAnswers(sessionId: number): Promise<QuestionAnswer[]> {
    throw new Error('Method not implemented.');
  }
}
