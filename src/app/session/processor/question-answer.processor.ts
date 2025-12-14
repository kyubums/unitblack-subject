import { QuestionType } from '../../survey/survey.schema';
import { SubmittingAnswer } from '../requests/submit-answer.requests';
import { QuestionAnswer } from '../session.schema';
import {
  MultiChoiceQuestionAnswerStrategy,
  QuestionStrategy,
  SingleChoiceQuestionAnswerStrategy,
  TextQuestionAnswerStrategy,
} from './question-answer.strategy';

export class QuestionAnswerProcessor {
  private strategy: QuestionStrategy;

  constructor(private questionAnswer: QuestionAnswer) {
    const questionSnapshot = questionAnswer.questionSnapshot;
    switch (questionSnapshot.type) {
      case QuestionType.SingleChoice:
        this.strategy = new SingleChoiceQuestionAnswerStrategy({
          ...questionAnswer,
          questionSnapshot,
        });
        break;
      case QuestionType.MultiChoice:
        this.strategy = new MultiChoiceQuestionAnswerStrategy({
          ...questionAnswer,
          questionSnapshot,
        });
        break;
      case QuestionType.Text:
        this.strategy = new TextQuestionAnswerStrategy({
          ...questionAnswer,
          questionSnapshot,
        });
        break;
      default:
        throw new Error(`Invalid question type`);
    }
  }

  submitAnswer(submittingAnswer: SubmittingAnswer | null) {
    if (this.questionAnswer.answer) {
      throw new Error('Answer already submitted');
    }

    this.strategy.submitAnswer(submittingAnswer);
  }

  validate() {
    this.strategy.validate();
  }

  getQuestionAnswer(): QuestionAnswer {
    return this.strategy.getQuestionAnswer();
  }

  getNextQuestionId(): string | null {
    return this.strategy.getNextQuestionId();
  }
}
