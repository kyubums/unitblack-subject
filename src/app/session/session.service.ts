import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { SurveyService } from '../survey/survey.service';
import { QuestionAnswerProcessor } from './question-answer.processor';
import {
  SQL_QUESTION_ANSWER_REPOSITORY,
  type QuestionAnswerRepository,
} from './question-answer.repository';
import { SubmitAnswerRequest } from './requests/submit-answer.requests';
import { SessionProcessor } from './session.processor';
import {
  SQL_SESSION_REPOSITORY,
  type SessionRepository,
} from './session.repository';
import { DetailSession, NewSession, Session } from './session.schema';

@Injectable()
export class SessionService {
  constructor(
    private readonly surveyService: SurveyService,

    @Inject(SQL_SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(SQL_QUESTION_ANSWER_REPOSITORY)
    private readonly questionAnswerRepository: QuestionAnswerRepository,
  ) {}

  async startSession(surveyId: string): Promise<Session> {
    const survey = await this.surveyService.getSurveyById(surveyId);

    const sessionToken = nanoid(); // 토큰발급

    const newSession: NewSession = {
      surveyId: survey.id,
      sessionToken,
      isCompleted: false,
      nextQuestionId: survey.startQuestionId,
    };

    const session = await this.sessionRepository.createSession(newSession);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session> {
    const session = await this.sessionRepository.getSessionByToken(token);
    if (!session) {
      throw new NotFoundException(`Session ${token} not found`);
    }
    return session;
  }

  async getDetailSession(token: string): Promise<DetailSession> {
    const session = await this.getSessionByToken(token);
    const answers = [];

    return {
      ...session,
      answers,
    };
  }

  async submitAnswer(token: string, dto: SubmitAnswerRequest) {
    const detailSession = await this.getDetailSession(token);

    // check if submittable
    const sessionProcessor = new SessionProcessor(detailSession);
    sessionProcessor.checkSubmittable(dto.questionId);

    const surveyQuestion = await this.surveyService.getSurveyQuestion(
      detailSession.surveyId,
      dto.questionId,
    );

    // validate and build QuestionAnswer and get nextQuestionId
    const questionAnswerProcessor = new QuestionAnswerProcessor(
      surveyQuestion,
      dto.answer,
    );
    const questionAnswer = questionAnswerProcessor.getQuestionAnswer();
    const nextQuestionId = questionAnswerProcessor.getNextQuestionId();
    const isCompleted = nextQuestionId === null;

    await this.questionAnswerRepository.submitAnswer(
      detailSession.id,
      questionAnswer,
    );

    detailSession.nextQuestionId = nextQuestionId;
    detailSession.isCompleted = isCompleted;

    await this.sessionRepository.updateSession(detailSession);

    return {
      nextQuestionId,
      completed: isCompleted,
      submittedAt: questionAnswer.submittedAt,
    };
  }
}
