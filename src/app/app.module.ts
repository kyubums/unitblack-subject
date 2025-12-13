import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { SurveyService } from './survey/survey.service';
import { SurveyController } from './survey/survey.controller';
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SurveyController, SessionController],
  providers: [SurveyService, SessionService],
})
export class AppModule {}
