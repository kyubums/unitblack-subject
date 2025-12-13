import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { QuestionAnswerEntity } from './question-answer.entity';
import { CommonEntity } from './common.entity';

@Entity()
export class AnswerSingleChoiceEntity extends CommonEntity {
  @OneToOne(() => QuestionAnswerEntity)
  @JoinColumn()
  questionAnswer: QuestionAnswerEntity;

  @Column()
  questionAnswerId: number;

  @Column()
  optionId: string;
}
