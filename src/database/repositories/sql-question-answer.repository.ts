import { Injectable } from '@nestjs/common';
import { QuestionAnswerRepository } from 'src/app/session/question-answer.repository';
import {
  Answer,
  MultiChoiceAnswer,
  QuestionAnswer,
  QuestionAnswerSchema,
  SingleChoiceAnswer,
} from 'src/app/session/session.schema';
import { QuestionType } from 'src/app/survey/survey.schema';
import { EntityManager, Repository } from 'typeorm';
import { AnswerMultiChoiceEntity } from '../entities/answer-multi-choice.entity';
import { AnswerSingleChoiceEntity } from '../entities/answer-single-choice.entity';
import { AnswerTextEntity } from '../entities/answer-text.entity';
import { QuestionAnswerEntity } from '../entities/question-answer.entity';
import { TransactionableRepository } from './transactionable.repository';

@Injectable()
export class SQLQuestionAnswerRepository
  extends TransactionableRepository
  implements QuestionAnswerRepository
{
  private readonly repository: Repository<QuestionAnswerEntity>;

  constructor(protected em: EntityManager) {
    super(em);

    this.repository = em.getRepository(QuestionAnswerEntity);
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
      questionSnapshot: questionAnswer.questionSnapshot,
      submittedAt: questionAnswer.submittedAt,
    });

    await this.repository.save(questionAnswerEntity);

    if (questionAnswer.answer) {
      await this.saveAnswer(questionAnswerEntity.id, questionAnswer.answer);
    }
  }

  private async saveAnswer(questionAnswerId: number, answer: Answer) {
    switch (answer.type) {
      case QuestionType.SingleChoice:
        const answerChoiceEntity = this.em.create(AnswerSingleChoiceEntity, {
          questionAnswerId,
          optionId: answer.optionId,
        });
        await this.em.save(answerChoiceEntity);
        return;
      case QuestionType.MultiChoice:
        const answerChoiceEntities = answer.optionIds.map((optionId) => {
          return this.em.create(AnswerMultiChoiceEntity, {
            questionAnswerId,
            optionId,
          });
        });
        await this.em.save(answerChoiceEntities);
        return;
      case QuestionType.Text:
        const answerTextEntity = this.em.create(AnswerTextEntity, {
          questionAnswerId,
          text: answer.text,
        });
        await this.em.save(answerTextEntity);
        return;
      default:
        throw new Error(`Invalid answer type`);
    }
  }

  async getQuestionAnswers(sessionId: number): Promise<QuestionAnswer[]> {
    const questionAnswerEntities = await this.repository.find({
      relations: {
        answerSingleChoice: true,
        answerMultiChoices: true,
        answerText: true,
      },
      where: { sessionId },
    });

    return questionAnswerEntities.map(mapQuestionAnswerEntityToQuestionAnswer);
  }
}

function mapQuestionAnswerEntityToQuestionAnswer(
  questionAnswerEntity: QuestionAnswerEntity,
): QuestionAnswer {
  const answer = mapQuestionAnswerEntityToAnswer(questionAnswerEntity);
  const questionAnswer: QuestionAnswer = {
    questionId: questionAnswerEntity.questionId,
    questionSnapshot: questionAnswerEntity.questionSnapshot,
    answer,
    submittedAt: questionAnswerEntity.submittedAt,
  };

  return QuestionAnswerSchema.parse(questionAnswer);
}

function mapQuestionAnswerEntityToAnswer(
  questionAnswerEntity: QuestionAnswerEntity,
): Answer | null {
  switch (questionAnswerEntity.questionSnapshot.type) {
    case QuestionType.SingleChoice:
      return mapSingleChoiceToAnswer(
        questionAnswerEntity.answerSingleChoice ?? null,
      );
    case QuestionType.MultiChoice:
      return mapMultiChoicesToAnswer(questionAnswerEntity.answerMultiChoices);
    case QuestionType.Text:
      if (!questionAnswerEntity.answerText) {
        return null;
      }

      return {
        type: QuestionType.Text,
        text: questionAnswerEntity.answerText.text,
      };
    default:
      throw new Error(`Invalid question type`);
  }
}

function mapSingleChoiceToAnswer(
  singleChoice: AnswerSingleChoiceEntity | null,
): SingleChoiceAnswer | null {
  if (!singleChoice) {
    return null;
  }

  return {
    type: QuestionType.SingleChoice,
    optionId: singleChoice.optionId,
  };
}

function mapMultiChoicesToAnswer(
  multiChoices: AnswerMultiChoiceEntity[],
): MultiChoiceAnswer | null {
  if (!multiChoices.length) {
    return null;
  }

  const optionIds = multiChoices.map((choice) => choice.optionId);

  return {
    type: QuestionType.MultiChoice,
    optionIds,
  };
}
