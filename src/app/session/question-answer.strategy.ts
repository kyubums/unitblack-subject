import { BadRequestException } from '@nestjs/common';
import {
  AnswerOption,
  MultiChoiceQuestion,
  NextQuestionAnswerOption,
  QuestionType,
  SingleChoiceQuestion,
  TextQuestion,
} from '../survey/survey.schema';
import { SubmittedAnswer } from './requests/submit-answer.requests';
import {
  Answer,
  MultiChoiceAnswer,
  MultiChoiceAnswerSchema,
  SingleChoiceAnswer,
  SingleChoiceAnswerSchema,
  TextAnswer,
  TextAnswerSchema,
} from './session.schema';

export interface QuestionStrategy {
  validate(submittedAnswer: SubmittedAnswer): void;
  transform(submittedAnswer: SubmittedAnswer): Answer;
  getNextQuestionId(submittedAnswer: SubmittedAnswer | null): string | null;
}

export class SingleChoiceQuestionAnswerStrategy implements QuestionStrategy {
  private optionById: { [key: string]: NextQuestionAnswerOption };

  constructor(private question: SingleChoiceQuestion) {
    this.optionById = this.question.options.reduce(
      (acc, option) => {
        acc[option.id] = option;
        return acc;
      },
      {} as { [key: string]: AnswerOption },
    );
  }

  validate(submittedAnswer: SubmittedAnswer): void {
    const { optionId } = submittedAnswer;
    if (!optionId) {
      throw new BadRequestException(`OptionId is required`);
    }

    const optionIdSet = new Set(Object.keys(this.optionById));
    const isValidOption = optionIdSet.has(optionId);
    if (!isValidOption) {
      throw new BadRequestException(`OptionId (${optionId}) not found`);
    }
  }

  transform(submittedAnswer: SubmittedAnswer): SingleChoiceAnswer {
    const optionId = submittedAnswer.optionId!;
    const option = this.optionById[optionId];
    return SingleChoiceAnswerSchema.parse({
      type: QuestionType.SingleChoice,
      optionId: option.id,
      label: option.label,
    });
  }

  getNextQuestionId(submittedAnswer: SubmittedAnswer | null): string | null {
    if (!submittedAnswer) {
      return null;
    }

    const optionId = submittedAnswer.optionId!;
    return this.optionById[optionId].nextQuestionId ?? null;
  }
}

export class MultiChoiceQuestionAnswerStrategy implements QuestionStrategy {
  constructor(private question: MultiChoiceQuestion) {}

  validate(submittedAnswer: SubmittedAnswer): void {
    const { optionIds } = submittedAnswer;
    if (!optionIds) {
      throw new BadRequestException(`OptionIds is required`);
    }

    const optionIdsSet = new Set(optionIds);

    if (optionIdsSet.size < this.question.minSelect) {
      throw new BadRequestException(
        `Should choice more than ${this.question.minSelect} options`,
      );
    }

    if (optionIdsSet.size > this.question.maxSelect) {
      throw new BadRequestException(
        `Should choice less than ${this.question.maxSelect} options`,
      );
    }

    const isValidOption = this.question.options.some((option) => {
      return optionIdsSet.has(option.id);
    });

    if (!isValidOption) {
      throw new BadRequestException(`OptionIds (${optionIdsSet}) not found`);
    }
  }

  transform(submittedAnswer: SubmittedAnswer): MultiChoiceAnswer {
    const optionIds = submittedAnswer.optionIds!;
    const optionById = this.question.options.reduce(
      (acc, option) => {
        acc[option.id] = option;
        return acc;
      },
      {} as { [key: string]: AnswerOption },
    );
    const choices = optionIds.map((optionId) => {
      return optionById[optionId];
    });

    return MultiChoiceAnswerSchema.parse({
      type: QuestionType.MultiChoice,
      choices,
    });
  }

  getNextQuestionId(_submittedAnswer: SubmittedAnswer | null): string | null {
    return this.question.nextQuestionId ?? null;
  }
}

export class TextQuestionAnswerStrategy implements QuestionStrategy {
  constructor(private question: TextQuestion) {}

  validate(submittedAnswer: SubmittedAnswer): void {
    const { text } = submittedAnswer;
    if (!text) {
      throw new BadRequestException(`Text is required`);
    }
  }

  transform(submittedAnswer: SubmittedAnswer): TextAnswer {
    return TextAnswerSchema.parse({
      type: QuestionType.Text,
      text: submittedAnswer.text!,
    });
  }

  getNextQuestionId(_submittedAnswer: SubmittedAnswer | null): string | null {
    return this.question.nextQuestionId ?? null;
  }
}
