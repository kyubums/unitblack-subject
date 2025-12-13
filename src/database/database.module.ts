import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SQLITE_CONFIG } from './database.config';
import { JSON_SURVEY_REPOSITORY } from 'src/app/survey/survey.repository';
import { JSONSurveyRepository } from './repositories/json-survey.repository';
import { SessionEntity } from './entities/session.entity';
import { QuestionAnswerEntity } from './entities/question-answer.entity';
import { AnswerTextEntity } from './entities/answer-text.entity';
import { AnswerChoiceEntity } from './entities/answer-choice.entity';
import { SQL_SESSION_REPOSITORY } from 'src/app/session/session.repository';
import { SQLSessionRepository } from './repositories/sql-session.repository';
import { SQL_QUESTION_ANSWER_REPOSITORY } from 'src/app/session/question-answer.repository';
import { SQLQuestionAnswerRepository } from './repositories/sql-question-answer.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(SQLITE_CONFIG),
    TypeOrmModule.forFeature([
      SessionEntity,
      QuestionAnswerEntity,
      AnswerTextEntity,
      AnswerChoiceEntity,
    ]),
  ],
  providers: [
    {
      provide: JSON_SURVEY_REPOSITORY,
      useClass: JSONSurveyRepository,
    },
    {
      provide: SQL_SESSION_REPOSITORY,
      useClass: SQLSessionRepository,
    },
    {
      provide: SQL_QUESTION_ANSWER_REPOSITORY,
      useClass: SQLQuestionAnswerRepository,
    },
  ],
  exports: [
    JSON_SURVEY_REPOSITORY,
    SQL_SESSION_REPOSITORY,
    SQL_QUESTION_ANSWER_REPOSITORY,
  ],
})
export class DatabaseModule {}
