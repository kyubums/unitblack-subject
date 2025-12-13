import { Survey } from './survey.schema';

export interface SurveyRepository {
  getAllServeys(): Promise<Survey[]>;
  getServeyById(id: string): Promise<Survey | null>;
}

export const JSON_SURVEY_REPOSITORY = 'JSON_SURVEY_REPOSITORY';
