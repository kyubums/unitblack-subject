export interface SurveyRepository {
  getAllServeys(): Promise<any>;
  getServeyById(id: string): Promise<any>;
}
