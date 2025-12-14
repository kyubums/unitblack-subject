import { QuestionAnswerProcessor } from './question-answer.processor';
import {
  SingleChoiceQuestionAnswerStrategy,
  MultiChoiceQuestionAnswerStrategy,
  TextQuestionAnswerStrategy,
  QuestionStrategy,
} from './question-answer.strategy';
import { QuestionAnswer } from '../session.schema';
import { QuestionType } from '../../survey/survey.schema';

describe('QuestionAnswerProcessor', () => {
  describe('Strategy 선택', () => {
    it('SingleChoice 타입일 때 SingleChoiceQuestionAnswerStrategy를 선택해야 함', () => {
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
        answer: null,
        submittedAt: new Date(0),
      };

      const processor = new QuestionAnswerProcessor(questionAnswer);

      // Strategy가 올바르게 선택되었는지 간접적으로 검증 (getNextQuestionId 동작 확인)
      expect(processor.getNextQuestionId()).toBeNull();
    });

    it('MultiChoice 타입일 때 MultiChoiceQuestionAnswerStrategy를 선택해야 함', () => {
      const questionAnswer: QuestionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
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
        },
        answer: null,
        submittedAt: new Date(0),
      };

      const processor = new QuestionAnswerProcessor(questionAnswer);

      // Strategy가 올바르게 선택되었는지 간접적으로 검증
      expect(processor.getNextQuestionId()).toBe('q2');
    });

    it('Text 타입일 때 TextQuestionAnswerStrategy를 선택해야 함', () => {
      const questionAnswer: QuestionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
          id: 'q1',
          type: QuestionType.Text,
          text: '질문 1',
          required: false,
          nextQuestionId: 'q2',
        },
        answer: null,
        submittedAt: new Date(0),
      };

      const processor = new QuestionAnswerProcessor(questionAnswer);

      // Strategy가 올바르게 선택되었는지 간접적으로 검증
      expect(processor.getNextQuestionId()).toBe('q2');
    });

    it('잘못된 타입일 때 Error를 던져야 함', () => {
      const questionAnswer = {
        questionId: 'q1',
        questionSnapshot: {
          id: 'q1',
          type: 'invalidType' as QuestionType,
          text: '질문 1',
        },
        answer: null,
        submittedAt: new Date(0),
      } as QuestionAnswer;

      expect(() => new QuestionAnswerProcessor(questionAnswer)).toThrow(
        new Error('Invalid question type'),
      );
    });
  });

  describe('submitAnswer', () => {
    it('Strategy의 submitAnswer가 호출되어야 함', () => {
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
        answer: null,
        submittedAt: new Date(0),
      };

      const processor = new QuestionAnswerProcessor(questionAnswer);
      const submittingAnswer = { optionId: 'o1' };

      const submitAnswerSpy = jest.spyOn(
        QuestionStrategy.prototype,
        'submitAnswer',
      );

      processor.submitAnswer(submittingAnswer);

      expect(submitAnswerSpy).toHaveBeenCalledWith(submittingAnswer);
      expect(submitAnswerSpy).toHaveBeenCalledTimes(1);

      submitAnswerSpy.mockRestore();
    });

    it('이미 제출된 답변이 있는 경우 Error를 던져야 함', () => {
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

      const processor = new QuestionAnswerProcessor(questionAnswer);

      expect(() => processor.submitAnswer({ optionId: 'o1' })).toThrow(
        new Error('Answer already submitted'),
      );
    });
  });

  describe('validate', () => {
    it('Strategy의 validate가 호출되어야 함', () => {
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

      const processor = new QuestionAnswerProcessor(questionAnswer);
      const validateSpy = jest.spyOn(QuestionStrategy.prototype, 'validate');

      processor.validate();

      expect(validateSpy).toHaveBeenCalledTimes(1);

      validateSpy.mockRestore();
    });
  });

  describe('getQuestionAnswer', () => {
    it('Strategy의 getQuestionAnswer가 호출되고 결과를 반환해야 함', () => {
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
        answer: null,
        submittedAt: new Date(0),
      };

      const processor = new QuestionAnswerProcessor(questionAnswer);
      const getQuestionAnswerSpy = jest.spyOn(
        QuestionStrategy.prototype,
        'getQuestionAnswer',
      );

      const result = processor.getQuestionAnswer();

      expect(getQuestionAnswerSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(questionAnswer);

      getQuestionAnswerSpy.mockRestore();
    });
  });

  describe('getNextQuestionId', () => {
    it('Strategy의 getNextQuestionId가 호출되고 결과를 반환해야 함', () => {
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
              nextQuestionId: 'q2',
            },
          ],
        },
        answer: {
          type: QuestionType.SingleChoice,
          optionId: 'o1',
        },
        submittedAt: new Date(),
      };

      const processor = new QuestionAnswerProcessor(questionAnswer);
      const getNextQuestionIdSpy = jest.spyOn(
        SingleChoiceQuestionAnswerStrategy.prototype,
        'getNextQuestionId',
      );

      const result = processor.getNextQuestionId();

      expect(getNextQuestionIdSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe('q2');

      getNextQuestionIdSpy.mockRestore();
    });
  });
});
