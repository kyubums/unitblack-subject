import { Column, Entity, OneToOne } from 'typeorm';
import { CommonEntity } from './common.entity';
import { QuestionAnswerEntity } from './question-answer.entity';

@Entity()
export class AnswerTextEntity extends CommonEntity {
  @OneToOne(() => QuestionAnswerEntity)
  questionAnswer: QuestionAnswerEntity;

  @Column()
  questionAnswerId: number;

  @Column()
  text: string;
}
