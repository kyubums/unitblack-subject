import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SQL_QUESTION_ANSWER_REPOSITORY } from 'src/app/session/question-answer.repository';
import { SQL_SESSION_REPOSITORY } from 'src/app/session/session.repository';
import { JSON_SURVEY_REPOSITORY } from 'src/app/survey/survey.repository';
import { POSTGRES_CONFIG } from './database.config';
import { AnswerMultiChoiceEntity } from './entities/answer-multi-choice.entity';
import { AnswerSingleChoiceEntity } from './entities/answer-single-choice.entity';
import { AnswerTextEntity } from './entities/answer-text.entity';
import { QuestionAnswerEntity } from './entities/question-answer.entity';
import { SessionEntity } from './entities/session.entity';
import { JSONSurveyRepository } from './repositories/json-survey.repository';
import { SQLQuestionAnswerRepository } from './repositories/sql-question-answer.repository';
import { SQLSessionRepository } from './repositories/sql-session.repository';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(POSTGRES_CONFIG),
    TypeOrmModule.forFeature([
      SessionEntity,
      QuestionAnswerEntity,
      AnswerSingleChoiceEntity,
      AnswerMultiChoiceEntity,
      AnswerTextEntity,
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
    TransactionService,
  ],
  exports: [
    JSON_SURVEY_REPOSITORY,
    SQL_SESSION_REPOSITORY,
    SQL_QUESTION_ANSWER_REPOSITORY,
    TransactionService,
  ],
})
export class DatabaseModule {}
