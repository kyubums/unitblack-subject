import { Config, JsonDB } from 'node-json-db';
import { JSONSurveyRepository } from 'src/database/repositories/json-survey.repository';

export class TestableJSONSurveyRepository extends JSONSurveyRepository {
  constructor(filePath: string) {
    super();
    this.db = new JsonDB(new Config(filePath, true, false, '/'));
  }
}
