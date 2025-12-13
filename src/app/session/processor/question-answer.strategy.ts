import { BadRequestException } from '@nestjs/common';
import { ItemRetriever } from '../../common/item-retriever';
import {
  AnswerOption,
  MultiChoiceQuestion,
  NextQuestionAnswerOption,
  QuestionType,
  SingleChoiceQuestion,
  TextQuestion,
} from '../../survey/survey.schema';
import { SubmittingAnswer } from '../requests/submit-answer.requests';
import {
  MultiChoiceAnswer,
  QuestionAnswer,
  SingleChoiceAnswer,
} from '../session.schema';

export abstract class QuestionStrategy {
  constructor(protected questionAnswer: QuestionAnswer) {}

  validate() {
    if (!this.questionAnswer.answer) {
      if (this.questionAnswer.questionSnapshot.required) {
        throw new Error('Answer is Required');
      }

      // bypass answer validation if answer is null
      return;
    }

    if (
      this.questionAnswer.questionSnapshot.type !==
      this.questionAnswer.answer.type
    ) {
      throw new Error('Answer type mismatched with question type');
    }

    this.validateAnswer();
  }

  submitAnswer(submittingAnswer: SubmittingAnswer | null) {
    if (submittingAnswer) {
      this.submitFormattedAnswer(submittingAnswer);
    }
    this.questionAnswer.submittedAt = new Date();
  }

  getQuestionAnswer(): QuestionAnswer {
    return this.questionAnswer;
  }

  protected abstract validateAnswer(): void;
  protected abstract submitFormattedAnswer(
    submittingAnswer: SubmittingAnswer,
  ): void;
  abstract getNextQuestionId(): string | null;
}

export class SingleChoiceQuestionAnswerStrategy extends QuestionStrategy {
  private optionRetriever: ItemRetriever<NextQuestionAnswerOption, 'id'>;

  constructor(
    protected questionAnswer: QuestionAnswer & {
      questionSnapshot: SingleChoiceQuestion;
    },
  ) {
    super(questionAnswer);

    this.optionRetriever = new ItemRetriever(
      questionAnswer.questionSnapshot.options,
      'id',
    );
  }

  protected validateAnswer(): void {
    const answer = this.getAnswer()!; // null-checked in validate()

    const { optionId } = answer;
    if (!optionId) {
      throw new BadRequestException(`OptionId is required`);
    }

    const isValidOption = this.optionRetriever.hasKey(optionId);
    if (!isValidOption) {
      throw new BadRequestException(`Invalid optionId (${optionId})`);
    }
  }

  protected submitFormattedAnswer(submittingAnswer: SubmittingAnswer) {
    const optionId = submittingAnswer.optionId!;
    this.questionAnswer.answer = {
      type: QuestionType.SingleChoice,
      optionId,
    };
  }

  getNextQuestionId(): string | null {
    const answer = this.getAnswer();
    if (!answer) {
      return null;
    }

    const selectedOption = this.optionRetriever.get(answer.optionId)!;
    return selectedOption.nextQuestionId ?? null;
  }

  private getAnswer() {
    if (!this.questionAnswer.answer) {
      return null;
    }

    // type checked in validate()
    return this.questionAnswer.answer as SingleChoiceAnswer;
  }
}

export class MultiChoiceQuestionAnswerStrategy extends QuestionStrategy {
  private question: MultiChoiceQuestion;
  private optionRetriever: ItemRetriever<AnswerOption, 'id'>;

  constructor(
    protected questionAnswer: QuestionAnswer & {
      questionSnapshot: MultiChoiceQuestion;
    },
  ) {
    super(questionAnswer);

    this.question = questionAnswer.questionSnapshot;
    this.optionRetriever = new ItemRetriever(
      questionAnswer.questionSnapshot.options,
      'id',
    );
  }

  protected validateAnswer(): void {
    const answer = this.questionAnswer.answer! as MultiChoiceAnswer;

    const { optionIds } = answer;
    if (!optionIds) {
      throw new BadRequestException(`OptionIds is required`);
    }

    const duplicatedOptionIds = optionIds.filter((optionId, index) => {
      return optionIds.indexOf(optionId) !== index;
    });
    if (duplicatedOptionIds.length) {
      throw new BadRequestException(
        `Duplicated optionIds (${duplicatedOptionIds})`,
      );
    }

    if (optionIds.length < this.question.minSelect) {
      throw new BadRequestException(
        `Should choice more than ${this.question.minSelect} options`,
      );
    }

    if (optionIds.length > this.question.maxSelect) {
      throw new BadRequestException(
        `Should choice less than ${this.question.maxSelect} options`,
      );
    }

    const invalidOptionIds = optionIds.filter(
      (optionId) => !this.optionRetriever.hasKey(optionId),
    );
    if (invalidOptionIds.length) {
      throw new BadRequestException(`Invalid optionIds (${invalidOptionIds})`);
    }
  }

  protected submitFormattedAnswer(submittingAnswer: SubmittingAnswer) {
    const optionIds = submittingAnswer.optionIds!;

    this.questionAnswer.answer = {
      type: QuestionType.MultiChoice,
      optionIds,
    };
  }

  getNextQuestionId(): string | null {
    return this.question.nextQuestionId ?? null;
  }
}

export class TextQuestionAnswerStrategy extends QuestionStrategy {
  private question: TextQuestion;

  constructor(
    protected questionAnswer: QuestionAnswer & {
      questionSnapshot: TextQuestion;
    },
  ) {
    super(questionAnswer);

    this.question = questionAnswer.questionSnapshot;
  }

  protected validateAnswer(): void {
    // NOTE: text answer has no specific validation yet
  }

  protected submitFormattedAnswer(submittingAnswer: SubmittingAnswer) {
    this.questionAnswer.answer = {
      type: QuestionType.Text,
      text: submittingAnswer.text!,
    };
  }

  getNextQuestionId(): string | null {
    return this.question.nextQuestionId ?? null;
  }
}
