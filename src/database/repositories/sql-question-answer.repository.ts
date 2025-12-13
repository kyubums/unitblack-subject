import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { QuestionAnswerRepository } from 'src/app/session/question-answer.repository';
import {
  Answer,
  MultiChoiceAnswer,
  QuestionAnswer,
  QuestionAnswerSchema,
  SingleChoiceAnswer,
} from 'src/app/session/session.schema';
import {
  AnswerOption,
  MultiChoiceQuestion,
  QuestionType,
  SingleChoiceQuestion,
} from 'src/app/survey/survey.schema';
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
        const answerChoiceEntity = this.answerChoiceRepository.create({
          questionAnswerId,
          optionId: answer.optionId,
        });
        await this.answerChoiceRepository.save(answerChoiceEntity);
        return;
      case QuestionType.MultiChoice:
        const answerChoiceEntities = answer.choices.map(({ optionId }) => {
          return this.answerChoiceRepository.create({
            questionAnswerId,
            optionId,
          });
        });
        await this.answerChoiceRepository.save(answerChoiceEntities);
        return;
      case QuestionType.Text:
        const answerTextEntity = this.answerTextRepository.create({
          questionAnswerId,
          text: answer.text,
        });
        await this.answerTextRepository.save(answerTextEntity);
        return;
      default:
        throw new Error(`Invalid answer type`);
    }
  }

  async getAnswers(sessionId: number): Promise<QuestionAnswer[]> {
    const questionAnswerEntities = await this.repository.find({
      relations: {
        answerChoices: true,
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
  const answer = buildAnswer(questionAnswerEntity);
  const questionAnswer: QuestionAnswer = {
    questionId: questionAnswerEntity.questionId,
    questionSnapshot: questionAnswerEntity.questionSnapshot,
    answer,
    submittedAt: questionAnswerEntity.submittedAt,
  };

  return QuestionAnswerSchema.parse(questionAnswer);
}

function buildAnswer(
  questionAnswerEntity: QuestionAnswerEntity,
): Answer | null {
  switch (questionAnswerEntity.questionSnapshot.type) {
    case QuestionType.SingleChoice:
      return buildSingleChoiceAnswer(
        questionAnswerEntity.questionSnapshot,
        questionAnswerEntity.answerChoices ?? [],
      );
    case QuestionType.MultiChoice:
      return buildMultiChoiceAnswer(
        questionAnswerEntity.questionSnapshot,
        questionAnswerEntity.answerChoices ?? [],
      );
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

function buildSingleChoiceAnswer(
  question: SingleChoiceQuestion,
  answerChoices: AnswerChoiceEntity[],
): SingleChoiceAnswer | null {
  if (!answerChoices.length) {
    return null;
  }
  const [answerChoiceEntity] = answerChoices;
  const selectedOption = question.options.find(
    (option) => option.id === answerChoiceEntity.optionId,
  );
  if (!selectedOption) {
    throw new InternalServerErrorException(
      `Invalid optionId for AnswerChoice(${answerChoiceEntity.id})`,
    );
  }

  return {
    type: QuestionType.SingleChoice,
    optionId: selectedOption.id,
    label: selectedOption.label,
  };
}

function buildMultiChoiceAnswer(
  question: MultiChoiceQuestion,
  answerChoices: AnswerChoiceEntity[],
): MultiChoiceAnswer | null {
  if (!answerChoices.length) {
    return null;
  }

  const optionByIds = question.options.reduce(
    (acc, option) => {
      acc[option.id] = option;
      return acc;
    },
    {} as { [key: string]: AnswerOption },
  );

  const choices = answerChoices.map((choice) => {
    const option = optionByIds[choice.optionId];
    if (!option) {
      throw new InternalServerErrorException(
        `Invalid optionId for AnswerChoice(${choice.id})`,
      );
    }

    return {
      optionId: option.id,
      label: option.label,
    };
  });

  return {
    type: QuestionType.MultiChoice,
    choices,
  };
}
