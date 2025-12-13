import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { SurveyService } from '../survey/survey.service';
import { QuestionAnswerHelper } from './question-answer.helper';
import {
  SQL_QUESTION_ANSWER_REPOSITORY,
  type QuestionAnswerRepository,
} from './question-answer.repository';
import { SubmitAnswerRequest } from './requests/submit-answer.requests';
import {
  SQL_SESSION_REPOSITORY,
  type SessionRepository,
} from './session.repository';
import {
  DetailSession,
  DetailSessionSchema,
  NewSession,
  QuestionAnswer,
  QuestionAnswerSchema,
  Session,
} from './session.schema';

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

    return DetailSessionSchema.parse({
      uuid: session.uuid,
      surveyId: session.surveyId,
      isCompleted: session.isCompleted,
      nextQuestionId: session.nextQuestionId,
      answers,
    });
  }

  async submitAnswer(token: string, dto: SubmitAnswerRequest) {
    const session = await this.getSessionByToken(token);

    const hasSubmittedAnswer =
      await this.questionAnswerRepository.hasSubmittedAnswer(
        session.id,
        dto.questionId,
      );
    if (hasSubmittedAnswer) {
      throw new BadRequestException('Already submitted');
    }

    if (session.nextQuestionId !== dto.questionId) {
      throw new BadRequestException('Not next question');
    }

    const surveyQuestion = await this.surveyService.getSurveyQuestion(
      session.surveyId,
      dto.questionId,
    );
    const questionAnswerHelper = new QuestionAnswerHelper(
      surveyQuestion,
      dto.answer,
    );
    questionAnswerHelper.validateAndTransform();
    const questionAnswer: QuestionAnswer = QuestionAnswerSchema.parse({
      questionId: surveyQuestion.id,
      questionText: surveyQuestion.text,
      answer: questionAnswerHelper.getAnswer() ?? null,
      submittedAt: new Date(),
    });

    await this.questionAnswerRepository.submitAnswer(
      session.id,
      questionAnswer,
    );

    session.nextQuestionId = questionAnswerHelper.getNextQuestionId();
    session.isCompleted = !session.nextQuestionId;

    await this.sessionRepository.updateSession(session);

    return {
      nextQuestionId: session.nextQuestionId,
      completed: session.isCompleted,
      submittedAt: questionAnswer.submittedAt,
    };
  }
}
