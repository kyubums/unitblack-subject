import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { QuestionAnswerEntity } from './question-answer.entity';
import { CommonEntity } from './common.entity';

@Entity()
export class AnswerSingleChoiceEntity extends CommonEntity {
  @OneToOne(() => QuestionAnswerEntity)
  @JoinColumn()
  questionAnswer: QuestionAnswerEntity;

  @Column()
  @Index()
  questionAnswerId: number;

  @Column()
  optionId: string;
}
