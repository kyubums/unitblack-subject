import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SessionProcessor } from './session.processor';
import { DetailSession } from '../session.schema';
import { QuestionType } from '../../survey/survey.schema';

describe('SessionProcessor', () => {
  describe('checkSubmittable', () => {
    it('정상 케이스: isCompleted=false, nextQuestionId 일치, 미제출 질문인 경우 예외가 발생하지 않아야 함', () => {
      const detailSession: DetailSession = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: 'test-token',
        surveyId: 'test-survey',
        isCompleted: false,
        nextQuestionId: 'q1',
        answers: [],
      };

      const processor = new SessionProcessor(detailSession);

      expect(() => processor.checkSubmittable('q1')).not.toThrow();
    });

    it('isCompleted=true인 경우 ForbiddenException을 던져야 함', () => {
      const detailSession: DetailSession = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: 'test-token',
        surveyId: 'test-survey',
        isCompleted: true,
        nextQuestionId: 'q1',
        answers: [],
      };

      const processor = new SessionProcessor(detailSession);

      expect(() => processor.checkSubmittable('q1')).toThrow(
        new ForbiddenException('Session already completed'),
      );
    });

    it('nextQuestionId와 questionId가 불일치하는 경우 BadRequestException을 던져야 함', () => {
      const detailSession: DetailSession = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: 'test-token',
        surveyId: 'test-survey',
        isCompleted: false,
        nextQuestionId: 'q1',
        answers: [],
      };

      const processor = new SessionProcessor(detailSession);

      expect(() => processor.checkSubmittable('q2')).toThrow(
        new BadRequestException('Invalid question step'),
      );
    });

    it('이미 제출된 질문인 경우 BadRequestException을 던져야 함', () => {
      const detailSession: DetailSession = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: 'test-token',
        surveyId: 'test-survey',
        isCompleted: false,
        nextQuestionId: 'q1',
        answers: [
          {
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
          },
        ],
      };

      const processor = new SessionProcessor(detailSession);

      expect(() => processor.checkSubmittable('q1')).toThrow(
        new BadRequestException('Question already submitted'),
      );
    });
  });
});
