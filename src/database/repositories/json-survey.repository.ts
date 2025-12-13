import { Injectable } from '@nestjs/common';
import { Config, JsonDB } from 'node-json-db';
import path from 'path';
import { SurveyRepository } from 'src/app/survey/survey.repository';
import { Survey, SurveySchema } from 'src/app/survey/survey.schema';

@Injectable()
export class JSONSurveyRepository implements SurveyRepository {
  private db: JsonDB;

  constructor() {
    const filePath = path.resolve(__dirname, '../../../json/survey.json');
    this.db = new JsonDB(new Config(filePath, true, false, '/'));
  }

  async getAllServeys(): Promise<Survey[]> {
    const result = (await this.db.getData('/')) as { [key: string]: any };

    return Object.values(result).map((item) => SurveySchema.parse(item));
  }

  async getServeyById(id: string): Promise<Survey | null> {
    if (!id) {
      // NOTE: id 가 빈값일 경우 root 가 탐색되므로 null 처리
      return null;
    }

    const survey = await this.db.getData(`/${id}`);
    if (!survey) {
      return null;
    }

    return SurveySchema.parse(survey);
  }
}
