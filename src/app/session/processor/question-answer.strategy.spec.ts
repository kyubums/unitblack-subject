import { BadRequestException } from '@nestjs/common';
import {
  QuestionStrategy,
  SingleChoiceQuestionAnswerStrategy,
  MultiChoiceQuestionAnswerStrategy,
  TextQuestionAnswerStrategy,
} from './question-answer.strategy';
import { QuestionAnswer } from '../session.schema';
import {
  SingleChoiceAnswerSchema,
  MultiChoiceAnswerSchema,
  TextAnswerSchema,
} from '../session.schema';
import {
  QuestionType,
  SingleChoiceQuestion,
  MultiChoiceQuestion,
  TextQuestion,
} from '../../survey/survey.schema';
import { SubmittingAnswer } from '../requests/submit-answer.requests';

// 각 Strategy별로 적절한 타입의 QuestionAnswer를 생성하는 헬퍼 함수들
function createSingleChoiceQuestionAnswer(
  questionSnapshot: Partial<SingleChoiceQuestion>,
  answer: { type: QuestionType.SingleChoice; optionId: string } | null = null,
): QuestionAnswer & { questionSnapshot: SingleChoiceQuestion } {
  return {
    questionId: questionSnapshot.id || 'q1',
    questionSnapshot: {
      id: questionSnapshot.id || 'q1',
      type: QuestionType.SingleChoice,
      text: questionSnapshot.text || '질문 1',
      required: true,
      options: questionSnapshot.options || [],
    },
    answer,
    submittedAt: answer ? new Date() : new Date(0),
  };
}

function createMultiChoiceQuestionAnswer(
  questionSnapshot: Partial<MultiChoiceQuestion>,
  answer: { type: QuestionType.MultiChoice; optionIds: string[] } | null = null,
): QuestionAnswer & { questionSnapshot: MultiChoiceQuestion } {
  return {
    questionId: questionSnapshot.id || 'q1',
    questionSnapshot: {
      id: questionSnapshot.id || 'q1',
      type: QuestionType.MultiChoice,
      text: questionSnapshot.text || '질문 1',
      required: questionSnapshot.required ?? false,
      options: questionSnapshot.options || [],
      minSelect: questionSnapshot.minSelect ?? 1,
      maxSelect: questionSnapshot.maxSelect ?? 2,
      nextQuestionId: questionSnapshot.nextQuestionId,
    },
    answer,
    submittedAt: answer ? new Date() : new Date(0),
  };
}

function createTextQuestionAnswer(
  questionSnapshot: Partial<TextQuestion>,
  answer: { type: QuestionType.Text; text: string } | null = null,
): QuestionAnswer & { questionSnapshot: TextQuestion } {
  return {
    questionId: questionSnapshot.id || 'q1',
    questionSnapshot: {
      id: questionSnapshot.id || 'q1',
      type: QuestionType.Text,
      text: questionSnapshot.text || '질문 1',
      required: questionSnapshot.required ?? false,
      nextQuestionId: questionSnapshot.nextQuestionId,
    },
    answer,
    submittedAt: answer ? new Date() : new Date(0),
  };
}

// QuestionStrategy 공통 로직 테스트를 위한 Mock 구현체
class MockQuestionStrategy extends QuestionStrategy {
  validateAnswer(): void {
    // Mock 구현
  }

  submitFormattedAnswer(_submittingAnswer: SubmittingAnswer): void {
    // Mock 구현
  }

  getNextQuestionId(): string | null {
    return null;
  }
}

describe('QuestionStrategy', () => {
  describe('validate', () => {
    it('answer가 null이고 required=true인 경우 Error를 던져야 함', () => {
      const questionAnswer: QuestionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
          id: 'q1',
          type: QuestionType.SingleChoice,
          text: '질문 1',
          required: true,
          options: [],
        },
        answer: null,
        submittedAt: new Date(0),
      };

      const strategy = new MockQuestionStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new Error('Answer is Required'),
      );
    });

    it('answer가 null이고 required=false인 경우 통과해야 함', () => {
      const questionAnswer: QuestionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
          id: 'q1',
          type: QuestionType.Text,
          text: '질문 1',
          required: false,
        },
        answer: null,
        submittedAt: new Date(0),
      };

      const strategy = new MockQuestionStrategy(questionAnswer);
      const validateAnswerSpy = jest.spyOn(
        MockQuestionStrategy.prototype,
        'validateAnswer',
      );

      strategy.validate();

      expect(validateAnswerSpy).not.toHaveBeenCalled();

      validateAnswerSpy.mockRestore();
    });

    it('answer type과 question type이 불일치하는 경우 Error를 던져야 함', () => {
      const questionAnswer: QuestionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
          id: 'q1',
          type: QuestionType.SingleChoice,
          text: '질문 1',
          required: true,
          options: [],
        },
        answer: {
          type: QuestionType.Text,
          text: '답변',
        },
        submittedAt: new Date(),
      };

      const strategy = new MockQuestionStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new Error('Answer type mismatched with question type'),
      );
    });

    it('answer type이 일치하는 경우 validateAnswer를 호출해야 함', () => {
      const questionAnswer: QuestionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
          id: 'q1',
          type: QuestionType.SingleChoice,
          text: '질문 1',
          required: true,
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
          ],
        },
        answer: {
          type: QuestionType.SingleChoice,
          optionId: 'o1',
        },
        submittedAt: new Date(),
      };

      const strategy = new MockQuestionStrategy(questionAnswer);
      const validateAnswerSpy = jest.spyOn(
        MockQuestionStrategy.prototype,
        'validateAnswer',
      );

      strategy.validate();

      expect(validateAnswerSpy).toHaveBeenCalledTimes(1);

      validateAnswerSpy.mockRestore();
    });
  });

  describe('submitAnswer', () => {
    it('submittingAnswer가 null인 경우 submitFormattedAnswer를 호출하지 않고 submittedAt만 업데이트해야 함', () => {
      const questionAnswer: QuestionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
          id: 'q1',
          type: QuestionType.Text,
          text: '질문 1',
          required: false,
        },
        answer: null,
        submittedAt: new Date(0),
      };

      const strategy = new MockQuestionStrategy(questionAnswer);
      const submitFormattedAnswerSpy = jest.spyOn(
        MockQuestionStrategy.prototype,
        'submitFormattedAnswer',
      );

      strategy.submitAnswer(null);

      expect(submitFormattedAnswerSpy).not.toHaveBeenCalled();
      expect(strategy.getQuestionAnswer().submittedAt).not.toEqual(new Date(0));
      expect(
        strategy.getQuestionAnswer().submittedAt.getTime(),
      ).toBeGreaterThan(0);

      submitFormattedAnswerSpy.mockRestore();
    });

    it('submittingAnswer가 있는 경우 submitFormattedAnswer를 호출하고 submittedAt을 업데이트해야 함', () => {
      const questionAnswer: QuestionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
          id: 'q1',
          type: QuestionType.Text,
          text: '질문 1',
          required: false,
        },
        answer: null,
        submittedAt: new Date(0),
      };

      const strategy = new MockQuestionStrategy(questionAnswer);
      const submitFormattedAnswerSpy = jest.spyOn(
        MockQuestionStrategy.prototype,
        'submitFormattedAnswer',
      );

      const submittingAnswer: SubmittingAnswer = { text: '답변' };
      strategy.submitAnswer(submittingAnswer);

      expect(submitFormattedAnswerSpy).toHaveBeenCalledWith(submittingAnswer);
      expect(submitFormattedAnswerSpy).toHaveBeenCalledTimes(1);
      expect(strategy.getQuestionAnswer().submittedAt).not.toEqual(new Date(0));
      expect(
        strategy.getQuestionAnswer().submittedAt.getTime(),
      ).toBeGreaterThan(0);

      submitFormattedAnswerSpy.mockRestore();
    });
  });
});

describe('SingleChoiceQuestionAnswerStrategy', () => {
  describe('validateAnswer', () => {
    it('optionId가 없는 경우 BadRequestException을 던져야 함', () => {
      const questionAnswer = createSingleChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
          ],
        },
        {
          type: QuestionType.SingleChoice,
          optionId: '',
        },
      );

      const strategy = new SingleChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new BadRequestException('OptionId is required'),
      );
    });

    it('유효하지 않은 optionId인 경우 BadRequestException을 던져야 함', () => {
      const questionAnswer = createSingleChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
          ],
        },
        {
          type: QuestionType.SingleChoice,
          optionId: 'invalid-option',
        },
      );

      const strategy = new SingleChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new BadRequestException('Invalid optionId (invalid-option)'),
      );
    });

    it('정상적인 optionId인 경우 통과해야 함', () => {
      const questionAnswer = createSingleChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
          ],
        },
        {
          type: QuestionType.SingleChoice,
          optionId: 'o1',
        },
      );

      const strategy = new SingleChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).not.toThrow();
    });
  });

  describe('submitFormattedAnswer', () => {
    it('answer가 SingleChoiceAnswerSchema로 검증을 통과해야 함', () => {
      const questionAnswer = createSingleChoiceQuestionAnswer({
        id: 'q1',
        text: '질문 1',
        options: [
          {
            id: 'o1',
            label: '옵션 1',
          },
        ],
      });

      const strategy = new SingleChoiceQuestionAnswerStrategy(questionAnswer);

      strategy.submitAnswer({ optionId: 'o1' });

      const result = strategy.getQuestionAnswer();
      expect(result.answer).not.toBeNull();
      expect(() => SingleChoiceAnswerSchema.parse(result.answer)).not.toThrow();
      expect(result.answer).toEqual({
        type: QuestionType.SingleChoice,
        optionId: 'o1',
      });
    });
  });

  describe('getNextQuestionId', () => {
    it('answer가 null인 경우 null을 반환해야 함', () => {
      const questionAnswer = createSingleChoiceQuestionAnswer({
        id: 'q1',
        text: '질문 1',
        options: [
          {
            id: 'o1',
            label: '옵션 1',
          },
        ],
      });

      const strategy = new SingleChoiceQuestionAnswerStrategy(questionAnswer);

      expect(strategy.getNextQuestionId()).toBeNull();
    });

    it('answer가 있는 경우 선택한 옵션의 nextQuestionId를 반환해야 함', () => {
      const questionAnswer = createSingleChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
              nextQuestionId: 'q2',
            },
          ],
        },
        {
          type: QuestionType.SingleChoice,
          optionId: 'o1',
        },
      );

      const strategy = new SingleChoiceQuestionAnswerStrategy(questionAnswer);

      expect(strategy.getNextQuestionId()).toBe('q2');
    });
  });
});

describe('MultiChoiceQuestionAnswerStrategy', () => {
  describe('validateAnswer', () => {
    it('optionIds가 없는 경우 BadRequestException을 던져야 함', () => {
      const questionAnswer = createMultiChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
          ],
          minSelect: 1,
          maxSelect: 2,
        },
        {
          type: QuestionType.MultiChoice,
          optionIds: undefined as any,
        },
      );

      const strategy = new MultiChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new BadRequestException('OptionIds is required'),
      );
    });

    it('중복된 optionIds가 있는 경우 BadRequestException을 던져야 함', () => {
      const questionAnswer = createMultiChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
            {
              id: 'o2',
              label: '옵션 2',
            },
          ],
          minSelect: 1,
          maxSelect: 2,
        },
        {
          type: QuestionType.MultiChoice,
          optionIds: ['o1', 'o1'],
        },
      );

      const strategy = new MultiChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new BadRequestException('Duplicated optionIds (o1)'),
      );
    });

    it('optionIds 개수가 minSelect보다 적은 경우 BadRequestException을 던져야 함', () => {
      const questionAnswer = createMultiChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
            {
              id: 'o2',
              label: '옵션 2',
            },
          ],
          minSelect: 2,
          maxSelect: 3,
        },
        {
          type: QuestionType.MultiChoice,
          optionIds: ['o1'],
        },
      );

      const strategy = new MultiChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new BadRequestException('Should choice more than 2 options'),
      );
    });

    it('optionIds 개수가 maxSelect보다 많은 경우 BadRequestException을 던져야 함', () => {
      const questionAnswer = createMultiChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
            {
              id: 'o2',
              label: '옵션 2',
            },
            {
              id: 'o3',
              label: '옵션 3',
            },
          ],
          minSelect: 1,
          maxSelect: 2,
        },
        {
          type: QuestionType.MultiChoice,
          optionIds: ['o1', 'o2', 'o3'],
        },
      );

      const strategy = new MultiChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new BadRequestException('Should choice less than 2 options'),
      );
    });

    it('유효하지 않은 optionIds가 있는 경우 BadRequestException을 던져야 함', () => {
      const questionAnswer = createMultiChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
          ],
          minSelect: 1,
          maxSelect: 2,
        },
        {
          type: QuestionType.MultiChoice,
          optionIds: ['o1', 'invalid-option'],
        },
      );

      const strategy = new MultiChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).toThrow(
        new BadRequestException('Invalid optionIds (invalid-option)'),
      );
    });

    it('정상적인 optionIds인 경우 통과해야 함', () => {
      const questionAnswer = createMultiChoiceQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
            {
              id: 'o2',
              label: '옵션 2',
            },
          ],
          minSelect: 1,
          maxSelect: 2,
        },
        {
          type: QuestionType.MultiChoice,
          optionIds: ['o1', 'o2'],
        },
      );

      const strategy = new MultiChoiceQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).not.toThrow();
    });
  });

  describe('submitFormattedAnswer', () => {
    it('answer가 MultiChoiceAnswerSchema로 검증을 통과해야 함', () => {
      const questionAnswer = createMultiChoiceQuestionAnswer({
        id: 'q1',
        text: '질문 1',
        options: [
          {
            id: 'o1',
            label: '옵션 1',
          },
          {
            id: 'o2',
            label: '옵션 2',
          },
        ],
        minSelect: 1,
        maxSelect: 2,
      });

      const strategy = new MultiChoiceQuestionAnswerStrategy(questionAnswer);

      strategy.submitAnswer({ optionIds: ['o1', 'o2'] });

      const result = strategy.getQuestionAnswer();
      expect(result.answer).not.toBeNull();
      expect(() => MultiChoiceAnswerSchema.parse(result.answer)).not.toThrow();
      expect(result.answer).toEqual({
        type: QuestionType.MultiChoice,
        optionIds: ['o1', 'o2'],
      });
    });
  });

  describe('getNextQuestionId', () => {
    it('question의 nextQuestionId를 반환해야 함', () => {
      const questionAnswer = createMultiChoiceQuestionAnswer({
        id: 'q1',
        type: QuestionType.MultiChoice,
        text: '질문 1',
        required: false,
        options: [
          {
            id: 'o1',
            label: '옵션 1',
          },
        ],
        minSelect: 1,
        maxSelect: 2,
        nextQuestionId: 'q2',
      });

      const strategy = new MultiChoiceQuestionAnswerStrategy(questionAnswer);

      expect(strategy.getNextQuestionId()).toBe('q2');
    });
  });
});

describe('TextQuestionAnswerStrategy', () => {
  describe('validateAnswer', () => {
    it('통과해야 함', () => {
      const questionAnswer = createTextQuestionAnswer(
        {
          id: 'q1',
          text: '질문 1',
        },
        {
          type: QuestionType.Text,
          text: '답변',
        },
      );

      const strategy = new TextQuestionAnswerStrategy(questionAnswer);

      expect(() => strategy.validate()).not.toThrow();
    });
  });

  describe('submitFormattedAnswer', () => {
    it('answer가 TextAnswerSchema로 검증을 통과해야 함', () => {
      const questionAnswer = createTextQuestionAnswer({
        id: 'q1',
        text: '질문 1',
      });

      const strategy = new TextQuestionAnswerStrategy(questionAnswer);

      strategy.submitAnswer({ text: '답변 텍스트' });

      const result = strategy.getQuestionAnswer();
      expect(result.answer).not.toBeNull();
      expect(() => TextAnswerSchema.parse(result.answer)).not.toThrow();
      expect(result.answer).toEqual({
        type: QuestionType.Text,
        text: '답변 텍스트',
      });
    });
  });

  describe('getNextQuestionId', () => {
    it('question의 nextQuestionId를 반환해야 함', () => {
      const questionAnswer = createTextQuestionAnswer({
        id: 'q1',
        text: '질문 1',
        nextQuestionId: 'q2',
      });

      const strategy = new TextQuestionAnswerStrategy(questionAnswer);

      expect(strategy.getNextQuestionId()).toBe('q2');
    });
  });
});
