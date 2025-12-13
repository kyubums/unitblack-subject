import { Controller, Get, Param } from '@nestjs/common';
import { SurveyService } from './survey.service';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get('/')
  async getAllSurveys() {
    const surveys = await this.surveyService.getAllSurveys();

    return surveys;
  }

  @Get('/:surveyId/questions/:questionId')
  async getQuestion(
    @Param('surveyId') surveyId: string,
    @Param('questionId') questionId: string,
  ) {
    const question = await this.surveyService.getSurveyQuestion(
      surveyId,
      questionId,
    );

    return question;
  }
}
