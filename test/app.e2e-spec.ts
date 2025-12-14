import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { SubmittingAnswer } from 'src/app/session/requests/submit-answer.requests';
import { AppModule } from 'src/app/app.module';
import { TestPostgresContainer } from './helpers/test-postgres-container';

describe('Session E2E', () => {
  let app: INestApplication<App>;
  let testContainer: TestPostgresContainer;

  // 시나리오 정의: 세션 시작부터 완료까지의 한 경로
  const testScenario = {
    surveyId: 'unitblack-join-survey',
    steps: [
      {
        questionId: 'q1',
        answer: { optionId: 'q1o1' } as SubmittingAnswer,
        expectedNextQuestionId: 'q2_impact',
        expectedCompleted: false,
      },
      {
        questionId: 'q2_impact',
        answer: { optionId: 'q2i_o1' } as SubmittingAnswer,
        expectedNextQuestionId: 'q3_scale',
        expectedCompleted: false,
      },
      {
        questionId: 'q3_scale',
        answer: { optionId: 'q3s_o1' } as SubmittingAnswer,
        expectedNextQuestionId: 'q4_scale_detail',
        expectedCompleted: false,
      },
      {
        questionId: 'q4_scale_detail',
        answer: { text: 'DAU 100만, 분당 요청 10만' } as SubmittingAnswer,
        expectedNextQuestionId: 'q3_workstyle',
        expectedCompleted: false,
      },
      {
        questionId: 'q3_workstyle',
        answer: { optionId: 'q3w_o1' } as SubmittingAnswer,
        expectedNextQuestionId: 'q6_workstyle',
        expectedCompleted: false,
      },
      {
        questionId: 'q6_workstyle',
        answer: {
          text: '최근 6개월간 프로젝트를 성공적으로 완료했습니다.',
        } as SubmittingAnswer,
        expectedNextQuestionId: 'q7_values',
        expectedCompleted: false,
      },
      {
        questionId: 'q7_values',
        answer: { optionIds: ['q7v_o1', 'q7v_o2'] } as SubmittingAnswer,
        expectedNextQuestionId: 'q8_final',
        expectedCompleted: false,
      },
      {
        questionId: 'q8_final',
        answer: null,
        expectedNextQuestionId: null,
        expectedCompleted: true,
      },
    ],
  };

  beforeAll(async () => {
    // Testcontainers로 테스트용 PostgreSQL 시작
    testContainer = new TestPostgresContainer();
    await testContainer.start();

    // 환경변수 설정 (기존 DatabaseModule이 이 값을 사용)
    process.env.DATABASE_URL = testContainer.getConnectionUri();
    process.env.MIGRATION_RUN = 'true';
  });

  afterAll(async () => {
    // 테스트용 컨테이너 정리
    await testContainer.stop();

    delete process.env.DATABASE_URL;
    delete process.env.MIGRATION_RUN;
  });

  beforeEach(async () => {
    // 기존 AppModule 사용 (환경변수로 테스트 DB 연결)
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    // 각 테스트 후 앱만 종료 (컨테이너는 유지)
    await app.close();
  });

  it('세션 시작부터 모든 답변 완료까지 전체 플로우 검증', async () => {
    // 1. 세션 시작
    const startResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({ surveyId: testScenario.surveyId })
      .expect(201);

    const sessionToken = startResponse.body.sessionToken;
    expect(sessionToken).toBeDefined();
    expect(startResponse.body.surveyId).toBe(testScenario.surveyId);
    expect(startResponse.body.isCompleted).toBe(false);
    expect(startResponse.body.nextQuestionId).toBe('q1');

    // 2. 각 단계별 답변 제출 및 검증
    for (let i = 0; i < testScenario.steps.length; i++) {
      const step = testScenario.steps[i];

      // 답변 제출
      const submitResponse = await request(app.getHttpServer())
        .post('/sessions/answers')
        .set('X-Session-Token', sessionToken)
        .send({
          questionId: step.questionId,
          answer: step.answer,
        })
        .expect(201);

      // SubmitAnswerResponse 검증
      expect(submitResponse.body.nextQuestionId).toBe(
        step.expectedNextQuestionId,
      );
      expect(submitResponse.body.completed).toBe(step.expectedCompleted);
      expect(submitResponse.body.submittedAt).toBeDefined();

      // 세션 상태 조회 및 검증
      const sessionResponse = await request(app.getHttpServer())
        .get('/sessions')
        .set('X-Session-Token', sessionToken)
        .expect(200);

      expect(sessionResponse.body.isCompleted).toBe(step.expectedCompleted);
      expect(sessionResponse.body.nextQuestionId).toBe(
        step.expectedNextQuestionId,
      );
      expect(sessionResponse.body.answers).toHaveLength(i + 1);
    }

    // 3. 최종 세션 상태 검증
    const finalSessionResponse = await request(app.getHttpServer())
      .get('/sessions')
      .set('X-Session-Token', sessionToken)
      .expect(200);

    // 모든 답변이 제출되었는지 확인
    testScenario.steps.forEach((step, index) => {
      const answer = finalSessionResponse.body.answers[index];
      expect(answer.questionId).toBe(step.questionId);
      if (step.answer) {
        expect(answer.answer).toBeDefined();
        expect(answer.answer.submittedAt).toBeDefined();
      } else {
        expect(answer.answer).toBeNull();
      }
    });
  });
});
