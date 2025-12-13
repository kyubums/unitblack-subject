import { BadRequestException } from '@nestjs/common';
import { Question, QuestionType } from '../survey/survey.schema';
import {
  MultiChoiceQuestionAnswerStrategy,
  QuestionStrategy,
  SingleChoiceQuestionAnswerStrategy,
  TextQuestionAnswerStrategy,
} from './question-answer.strategy';
import { SubmittedAnswer } from './requests/submit-answer.requests';
import { Answer, QuestionAnswer } from './session.schema';

export class QuestionAnswerProcessor {
  private strategy: QuestionStrategy;

  constructor(
    private question: Question,
    private submittedAnswer: SubmittedAnswer | null,
  ) {
    switch (question.type) {
      case QuestionType.SingleChoice:
        this.strategy = new SingleChoiceQuestionAnswerStrategy(question);
        break;
      case QuestionType.MultiChoice:
        this.strategy = new MultiChoiceQuestionAnswerStrategy(question);
        break;
      case QuestionType.Text:
        this.strategy = new TextQuestionAnswerStrategy(question);
        break;
      default:
        throw new Error(`Invalid question type`);
    }
  }

  getQuestionAnswer(): QuestionAnswer {
    const answer = this.buildAnswer();

    return {
      questionId: this.question.id,
      questionSnapshot: this.question,
      answer,
      submittedAt: new Date(),
    };
  }

  private buildAnswer(): Answer | null {
    // If answer is not submitted, validate required only
    if (!this.submittedAnswer) {
      if (!this.question.required) {
        throw new BadRequestException('Answer is Required');
      }

      return null;
    }

    this.strategy.validate(this.submittedAnswer);
    return this.strategy.transform(this.submittedAnswer);
  }

  getNextQuestionId(): string | null {
    return this.strategy.getNextQuestionId(this.submittedAnswer);
  }
}
