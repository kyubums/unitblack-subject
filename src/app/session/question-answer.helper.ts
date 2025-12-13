import { Question, QuestionType } from '../survey/survey.schema';
import {
  MultiChoiceQuestionAnswerStrategy,
  QuestionStrategy,
  SingleChoiceQuestionAnswerStrategy,
  TextQuestionAnswerStrategy,
} from './question-answer.strategy';
import { SubmittedAnswer } from './requests/submit-answer.requests';
import { Answer } from './session.schema';

export class QuestionAnswerHelper {
  private strategy: QuestionStrategy;
  private transformedAnswer: Answer | null;

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

  validateAndTransform() {
    if (!this.submittedAnswer) {
      if (this.question.required) {
        throw new Error('Answer is Required');
      }
      return null;
    }
    this.strategy.validate(this.submittedAnswer);
    this.transformedAnswer = this.submittedAnswer
      ? this.strategy.transform(this.submittedAnswer)
      : null;
  }

  getAnswer(): Answer | null {
    return this.transformedAnswer;
  }

  getNextQuestionId(): string | null {
    return this.strategy.getNextQuestionId(this.submittedAnswer);
  }
}
