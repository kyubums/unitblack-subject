import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { SurveyService } from '../survey/survey.service';
import { QuestionAnswerProcessor } from './processor/question-answer.processor';
import {
  SQL_QUESTION_ANSWER_REPOSITORY,
  type QuestionAnswerRepository,
} from './question-answer.repository';
import { SubmitAnswerRequest } from './requests/submit-answer.requests';
import { SessionProcessor } from './processor/session.processor';
import {
  SQL_SESSION_REPOSITORY,
  type SessionRepository,
} from './session.repository';
import {
  DetailSession,
  NewSession,
  QuestionAnswer,
  Session,
} from './session.schema';
import { TransactionService } from 'src/database/services/transaction.service';
import { SubmitAnswerResponse } from './responses/submit-answer.response';

@Injectable()
export class SessionService {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly transactionService: TransactionService,

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

  async getDetailSessionByToken(token: string): Promise<DetailSession> {
    const session = await this.getSessionByToken(token);
    const questionAnswers =
      await this.questionAnswerRepository.getQuestionAnswers(session.id);

    const validatedQuestionAnswers = questionAnswers.map((questionAnswer) => {
      const questionAnswerProcessor = new QuestionAnswerProcessor(
        questionAnswer,
      );

      try {
        questionAnswerProcessor.validate();
        return questionAnswerProcessor.getQuestionAnswer();
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    });

    return {
      ...session,
      answers: validatedQuestionAnswers,
    };
  }

  async submitAnswer(
    token: string,
    dto: SubmitAnswerRequest,
  ): Promise<SubmitAnswerResponse> {
    const detailSession = await this.getDetailSessionByToken(token);

    // check if submittable
    const sessionProcessor = new SessionProcessor(detailSession);
    sessionProcessor.checkSubmittable(dto.questionId);

    const surveyQuestion = await this.surveyService.getSurveyQuestion(
      detailSession.surveyId,
      dto.questionId,
    );

    // validate and build QuestionAnswer and get nextQuestionId
    const newQuestionAnswer: QuestionAnswer = {
      questionId: dto.questionId,
      questionSnapshot: surveyQuestion,
      answer: null,
      submittedAt: new Date(0),
    };

    // submit answer and validate QuestionAnswer
    const questionAnswerProcessor = new QuestionAnswerProcessor(
      newQuestionAnswer,
    );
    questionAnswerProcessor.submitAnswer(dto.answer);

    try {
      questionAnswerProcessor.validate();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const questionAnswer = questionAnswerProcessor.getQuestionAnswer();
    const nextQuestionId = questionAnswerProcessor.getNextQuestionId();
    const isCompleted = nextQuestionId === null;

    await this.transactionService.execute(async (em) => {
      await this.questionAnswerRepository
        .withTX(em)
        .submitAnswer(detailSession.id, questionAnswer);

      await this.sessionRepository.withTX(em).updateSession(detailSession.id, {
        isCompleted: isCompleted,
        nextQuestionId: nextQuestionId,
      });
    });

    return {
      nextQuestionId,
      completed: isCompleted,
      submittedAt: questionAnswer.submittedAt,
    };
  }
}
