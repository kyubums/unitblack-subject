import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { SessionToken, SessionTokenRequired } from '../common/session-token';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { SessionService } from './session.service';
import {
  type CreateSessionRequest,
  CreateSessionRequestSchema,
} from './requests/session.requests';
import {
  CreateSessionResponse,
  CreateSessionResponseSchema,
} from './responses/session.responses';
import {
  SubmitAnswerRequestSchema,
  type SubmitAnswerRequest,
} from './requests/submit-answer.requests';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UsePipes(new ZodValidationPipe(CreateSessionRequestSchema, 'body'))
  @Post('/')
  async startSession(
    @Body() dto: CreateSessionRequest,
  ): Promise<CreateSessionResponse> {
    const session = await this.sessionService.startSession(dto.surveyId);
    return CreateSessionResponseSchema.parse(session);
  }

  @SessionTokenRequired()
  @Get('/')
  async getDetailSession(@SessionToken() sessionToken: string) {
    const session = await this.sessionService.getDetailSession(sessionToken);
    return session;
  }

  @SessionTokenRequired()
  @Post('/answers')
  @UsePipes(new ZodValidationPipe(SubmitAnswerRequestSchema, 'body'))
  async submitAnswer(
    @SessionToken() sessionToken: string,
    @Body() dto: SubmitAnswerRequest,
  ) {
    const result = await this.sessionService.submitAnswer(sessionToken, dto);

    return result;
  }
}
