import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  JSON_SURVEY_REPOSITORY,
  type SurveyRepository,
} from './survey.repository';
import { Question, Survey } from './survey.schema';

@Injectable()
export class SurveyService {
  constructor(
    @Inject(JSON_SURVEY_REPOSITORY)
    private readonly surveyRepository: SurveyRepository,
  ) {}

  async getAllSurveys(): Promise<Survey[]> {
    return this.surveyRepository.getAllServeys();
  }

  async getSurveyById(surveyId: string): Promise<Survey> {
    if (!surveyId) {
      throw new BadRequestException('Survey ID is required');
    }

    const survey = await this.surveyRepository.getServeyById(surveyId);
    if (!survey) {
      throw new NotFoundException(`Survey(${surveyId}) not found`);
    }

    return survey;
  }

  async getSurveyQuestion(
    surveyId: string,
    questionId: string,
  ): Promise<Question> {
    const survey = await this.getSurveyById(surveyId);
    const question = survey.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new NotFoundException(
        `Question(${questionId}) of Survey(${surveyId}) not found`,
      );
    }

    return question;
  }
}
