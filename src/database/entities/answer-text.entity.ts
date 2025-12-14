import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { CommonEntity } from './common.entity';
import { QuestionAnswerEntity } from './question-answer.entity';

@Entity()
export class AnswerTextEntity extends CommonEntity {
  @OneToOne(() => QuestionAnswerEntity)
  @JoinColumn()
  questionAnswer: QuestionAnswerEntity;

  @Column()
  @Index()
  questionAnswerId: number;

  @Column()
  text: string;
}
