import { type Question } from 'src/app/survey/survey.schema';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { AnswerMultiChoiceEntity } from './answer-multi-choice.entity';
import { AnswerSingleChoiceEntity } from './answer-single-choice.entity';
import { AnswerTextEntity } from './answer-text.entity';
import { CommonEntity } from './common.entity';
import { SessionEntity } from './session.entity';

@Entity()
@Unique('uniq-question-answer', ['sessionId', 'questionId'])
export class QuestionAnswerEntity extends CommonEntity {
  @ManyToOne(() => SessionEntity)
  session: SessionEntity;

  @Column()
  @Index()
  sessionId: number;

  @Column()
  questionId: string;

  @Column()
  submittedAt: Date;

  @Column('json')
  questionSnapshot: Question;

  @OneToOne(() => AnswerSingleChoiceEntity, (entity) => entity.questionAnswer)
  answerSingleChoice?: AnswerSingleChoiceEntity;

  @OneToMany(() => AnswerMultiChoiceEntity, (entity) => entity.questionAnswer)
  answerMultiChoices: AnswerMultiChoiceEntity[];

  @OneToOne(() => AnswerTextEntity, (entity) => entity.questionAnswer)
  answerText?: AnswerTextEntity;
}
