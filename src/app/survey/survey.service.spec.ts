import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { JSON_SURVEY_REPOSITORY } from './survey.repository';
import { SurveyService } from './survey.service';
import { TestableJSONSurveyRepository } from '../../../test/helpers/test-json-survey.repository';

describe('SurveyService', () => {
  let service: SurveyService;
  let testDbPath: string;
  let testRepository: TestableJSONSurveyRepository;

  const testSurveyData = {
    'test-survey-1': {
      id: 'test-survey-1',
      title: '테스트 설문 1',
      version: 1,
      startQuestionId: 'q1',
      questions: [
        {
          id: 'q1',
          type: 'singleChoice',
          text: '테스트 질문 1',
          required: true,
          options: [
            {
              id: 'o1',
              label: '옵션 1',
            },
          ],
        },
      ],
    },
    'test-survey-2': {
      id: 'test-survey-2',
      title: '테스트 설문 2',
      version: 1,
      startQuestionId: 'q2',
      questions: [
        {
          id: 'q2',
          type: 'text',
          text: '테스트 질문 2',
          required: false,
          nextQuestionId: null,
        },
      ],
    },
  };

  beforeEach(async () => {
    // tmp 디렉토리 생성
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // 임시 JSON 파일 생성
    testDbPath = path.join(tmpDir, 'survey.json');
    fs.writeFileSync(testDbPath, JSON.stringify(testSurveyData, null, 2));

    // TestableJSONSurveyRepository 인스턴스 생성
    testRepository = new TestableJSONSurveyRepository(testDbPath);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyService,
        {
          provide: JSON_SURVEY_REPOSITORY,
          useValue: testRepository,
        },
      ],
    }).compile();

    service = module.get<SurveyService>(SurveyService);
  });

  afterEach(() => {
    // 임시 파일 삭제
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('getAllSurveys', () => {
    it('모든 설문을 반환해야 함', async () => {
      const surveys = await service.getAllSurveys();

      expect(surveys).toHaveLength(2);
      expect(surveys[0].id).toBe('test-survey-1');
      expect(surveys[1].id).toBe('test-survey-2');
    });
  });

  describe('getSurveyById', () => {
    it('존재하는 surveyId로 설문을 조회해야 함', async () => {
      const survey = await service.getSurveyById('test-survey-1');

      expect(survey.id).toBe('test-survey-1');
      expect(survey.title).toBe('테스트 설문 1');
    });

    it('존재하지 않는 surveyId로 조회 시 NotFoundException을 던져야 함', async () => {
      await expect(
        service.getSurveyById('non-existent-survey'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getSurveyById('non-existent-survey'),
      ).rejects.toThrow('Survey(non-existent-survey) not found');
    });

    it('빈 문자열 surveyId로 조회 시 BadRequestException을 던져야 함', async () => {
      await expect(service.getSurveyById('')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getSurveyById('')).rejects.toThrow(
        'Survey ID is required',
      );
    });
  });

  describe('getSurveyQuestion', () => {
    it('존재하는 surveyId와 questionId로 질문을 조회해야 함', async () => {
      const question = await service.getSurveyQuestion('test-survey-1', 'q1');

      expect(question.id).toBe('q1');
      expect(question.text).toBe('테스트 질문 1');
    });

    it('존재하지 않는 surveyId로 조회 시 NotFoundException을 던져야 함', async () => {
      await expect(
        service.getSurveyQuestion('non-existent-survey', 'q1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('존재하지 않는 questionId로 조회 시 NotFoundException을 던져야 함', async () => {
      await expect(
        service.getSurveyQuestion('test-survey-1', 'non-existent-question'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getSurveyQuestion('test-survey-1', 'non-existent-question'),
      ).rejects.toThrow(
        'Question(non-existent-question) of Survey(test-survey-1) not found',
      );
    });

    it('다른 설문의 questionId로 조회 시 NotFoundException을 던져야 함', async () => {
      await expect(
        service.getSurveyQuestion('test-survey-1', 'q2'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
