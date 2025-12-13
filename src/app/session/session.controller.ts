import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { SessionToken, SessionTokenRequired } from '../common/session-token';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { SessionService } from './session.service';
import {
  SubmitAnswerRequestSchema,
  type SubmitAnswerRequest,
} from './requests/submit-answer.requests';
import {
  type StartSessionRequest,
  StartSessionRequestSchema,
} from './requests/start-session.requests';
import {
  type StartSessionResponse,
  StartSessionResponseSchema,
} from './responses/start-session.responses';
import { GetSessionResponse } from './responses/get-session.response';
import { mapDetailSessionToGetSessionResponse } from './mappers/get-question.mapper';
import { SubmitAnswerResponse } from './responses/submit-answer.response';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UsePipes(new ZodValidationPipe(StartSessionRequestSchema, 'body'))
  @Post('/')
  async startSession(
    @Body() dto: StartSessionRequest,
  ): Promise<StartSessionResponse> {
    const session = await this.sessionService.startSession(dto.surveyId);
    return StartSessionResponseSchema.parse(session);
  }

  @SessionTokenRequired()
  @Get('/')
  async getDetailSession(
    @SessionToken() sessionToken: string,
  ): Promise<GetSessionResponse> {
    const session =
      await this.sessionService.getDetailSessionByToken(sessionToken);
    return mapDetailSessionToGetSessionResponse(session);
  }

  @SessionTokenRequired()
  @Post('/answers')
  @UsePipes(new ZodValidationPipe(SubmitAnswerRequestSchema, 'body'))
  async submitAnswer(
    @SessionToken() sessionToken: string,
    @Body() dto: SubmitAnswerRequest,
  ): Promise<SubmitAnswerResponse> {
    const response = await this.sessionService.submitAnswer(sessionToken, dto);
    return response;
  }
}
