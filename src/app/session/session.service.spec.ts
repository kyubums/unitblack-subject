import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { SessionService } from './session.service';
import { SurveyService } from '../survey/survey.service';
import { TransactionService } from 'src/database/services/transaction.service';
import {
  SQL_SESSION_REPOSITORY,
  type SessionRepository,
} from './session.repository';
import {
  SQL_QUESTION_ANSWER_REPOSITORY,
  type QuestionAnswerRepository,
} from './question-answer.repository';
import { Session, DetailSession, QuestionAnswer } from './session.schema';
import { QuestionType } from '../survey/survey.schema';
import { nanoid } from 'nanoid';

describe('SessionService', () => {
  let service: SessionService;
  let surveyService: jest.Mocked<SurveyService>;
  let transactionService: jest.Mocked<TransactionService>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let questionAnswerRepository: jest.Mocked<QuestionAnswerRepository>;

  const mockEntityManager = {} as EntityManager;

  beforeEach(async () => {
    const mockSurveyService = {
      getSurveyById: jest.fn(),
      getSurveyQuestion: jest.fn(),
    };

    const mockTransactionService = {
      execute: jest.fn().mockImplementation(async (callback) => {
        return callback(mockEntityManager);
      }),
    };

    const mockSessionRepository: jest.Mocked<SessionRepository> = {
      createSession: jest.fn(),
      getSessionByToken: jest.fn(),
      updateSession: jest.fn(),
      withTX: jest.fn().mockReturnThis(),
    };

    const mockQuestionAnswerRepository: jest.Mocked<QuestionAnswerRepository> =
      {
        getQuestionAnswers: jest.fn(),
        submitAnswer: jest.fn(),
        hasSubmittedAnswer: jest.fn(),
        withTX: jest.fn().mockReturnThis(),
      };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SurveyService,
          useValue: mockSurveyService,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: SQL_SESSION_REPOSITORY,
          useValue: mockSessionRepository,
        },
        {
          provide: SQL_QUESTION_ANSWER_REPOSITORY,
          useValue: mockQuestionAnswerRepository,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    surveyService = module.get(SurveyService);
    transactionService = module.get(TransactionService);
    sessionRepository = module.get(SQL_SESSION_REPOSITORY);
    questionAnswerRepository = module.get(SQL_QUESTION_ANSWER_REPOSITORY);
  });

  describe('startSession', () => {
    it('정상적으로 세션을 생성해야 함', async () => {
      const surveyId = 'survey-1';
      const mockSurvey = {
        id: 'survey-1',
        title: '테스트 설문',
        version: 1,
        startQuestionId: 'q1',
        questions: [],
      };

      jest
        .spyOn(service, 'generateSessionToken')
        .mockReturnValue('generated-token');
      surveyService.getSurveyById.mockResolvedValue(mockSurvey as any);

      await service.startSession(surveyId);

      expect(sessionRepository.createSession).toHaveBeenCalledWith({
        sessionToken: expect.any(String),
        surveyId: 'survey-1',
        isCompleted: false,
        nextQuestionId: 'q1',
      });
    });

    it('설문이 존재하지 않는 경우 NotFoundException을 던져야 함', async () => {
      const surveyId = 'non-existent-survey';

      surveyService.getSurveyById.mockRejectedValue(
        new NotFoundException('Survey not found'),
      );

      await expect(service.startSession(surveyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSessionByToken', () => {
    it('정상적으로 세션을 조회해야 함', async () => {
      const token = 'valid-token';
      const mockSession: Session = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: 'valid-token',
        surveyId: 'survey-1',
        isCompleted: false,
        nextQuestionId: 'q1',
      };

      // mock valid response
      sessionRepository.getSessionByToken.mockResolvedValue(mockSession);

      const result = await service.getSessionByToken(token);

      expect(sessionRepository.getSessionByToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockSession);
    });

    it('존재하지 않는 token인 경우 NotFoundException을 던져야 함', async () => {
      const token = 'invalid-token';

      // mock not exists response
      sessionRepository.getSessionByToken.mockResolvedValue(null);

      await expect(service.getSessionByToken(token)).rejects.toThrow(
        new NotFoundException(`Session ${token} not found`),
      );
    });
  });

  describe('getDetailSessionByToken', () => {
    it('정상적으로 DetailSession을 반환해야 함', async () => {
      const token = 'valid-token';
      const mockSession: Session = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: 'valid-token',
        surveyId: 'survey-1',
        isCompleted: false,
        nextQuestionId: 'q1',
      };

      const mockQuestionAnswers: QuestionAnswer[] = [
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
      ];

      sessionRepository.getSessionByToken.mockResolvedValue(mockSession);
      questionAnswerRepository.getQuestionAnswers.mockResolvedValue(
        mockQuestionAnswers,
      );

      const result = await service.getDetailSessionByToken(token);

      expect(result).toEqual({
        ...mockSession,
        answers: mockQuestionAnswers,
      });
    });

    it('답변 검증 실패 시 InternalServerErrorException을 던져야 함 (Malformed Data)', async () => {
      const token = 'valid-token';
      const mockSession: Session = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        sessionToken: 'valid-token',
        surveyId: 'survey-1',
        isCompleted: false,
        nextQuestionId: 'q1',
      };

      const mockQuestionAnswers: QuestionAnswer[] = [
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
            optionId: 'invalid-option', // 유효하지 않은 옵션
          },
          submittedAt: new Date(),
        },
      ];

      sessionRepository.getSessionByToken.mockResolvedValue(mockSession);
      questionAnswerRepository.getQuestionAnswers.mockResolvedValue(
        mockQuestionAnswers,
      );

      await expect(service.getDetailSessionByToken(token)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('submitAnswer', () => {
    const mockDetailSession: DetailSession = {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      sessionToken: 'valid-token',
      surveyId: 'survey-1',
      isCompleted: false,
      nextQuestionId: 'q1',
      answers: [],
    };

    const mockSurveyQuestion = {
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
    };

    beforeEach(() => {
      sessionRepository.getSessionByToken.mockResolvedValue(mockDetailSession);
      questionAnswerRepository.getQuestionAnswers.mockResolvedValue([]);
      surveyService.getSurveyQuestion.mockResolvedValue(
        mockSurveyQuestion as any,
      );
    });

    it('정상적으로 답변을 제출해야 함', async () => {
      const token = 'valid-token';
      const dto = {
        questionId: 'q1',
        answer: { optionId: 'o1' },
      };

      const result = await service.submitAnswer(token, dto);

      expect(result.nextQuestionId).toBe('q2');
      expect(result.completed).toBe(false);
      expect(result.submittedAt).toBeInstanceOf(Date);

      expect(questionAnswerRepository.submitAnswer).toHaveBeenCalledWith(
        mockDetailSession.id,
        {
          questionId: 'q1',
          questionSnapshot: mockSurveyQuestion,
          answer: {
            type: QuestionType.SingleChoice,
            optionId: 'o1',
          },
          submittedAt: expect.any(Date),
        },
      );

      expect(sessionRepository.updateSession).toHaveBeenCalledWith(
        mockDetailSession.id,
        {
          isCompleted: false,
          nextQuestionId: 'q2',
        },
      );
    });

    it('다음 질문이 없는 경우 isCompleted가 true로 업데이트되어야 함', async () => {
      const token = 'valid-token';
      const finalQuestion = {
        id: 'q2',
        type: QuestionType.Text,
        text: '마지막 질문',
        required: false,
        nextQuestionId: null,
      };

      const mockFinalSession: Session = {
        ...mockDetailSession,
        nextQuestionId: 'q2',
      };

      sessionRepository.getSessionByToken.mockResolvedValue(mockFinalSession);
      surveyService.getSurveyQuestion.mockResolvedValue(finalQuestion as any);

      const dto = {
        questionId: 'q2',
        answer: { text: '답변' },
      };

      const result = await service.submitAnswer(token, dto);

      expect(result.nextQuestionId).toBeNull();
      expect(result.completed).toBe(true);

      expect(sessionRepository.updateSession).toHaveBeenCalledWith(
        mockFinalSession.id,
        {
          isCompleted: true,
          nextQuestionId: null,
        },
      );
    });

    it('SessionProcessor.checkSubmittable 실패 시 에러 throw', async () => {
      const token = 'valid-token';
      const completedSession: DetailSession = {
        ...mockDetailSession,
        isCompleted: true, // 완료된 세션에 대한 제출로 가정
      };

      sessionRepository.getSessionByToken.mockResolvedValue(completedSession);

      const dto = {
        questionId: 'q1',
        answer: { optionId: 'o1' },
      };

      await expect(service.submitAnswer(token, dto)).rejects.toThrow(
        expect.any(Error),
      );
    });

    it('QuestionAnswerProcessor.validate 실패 시 BadRequestException을 던져야 함', async () => {
      const token = 'valid-token';
      const dto = {
        questionId: 'q1',
        answer: { optionId: 'invalid-option' },
      };

      await expect(service.submitAnswer(token, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
