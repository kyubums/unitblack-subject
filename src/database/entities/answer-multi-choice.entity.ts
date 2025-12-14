import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { CommonEntity } from './common.entity';
import { QuestionAnswerEntity } from './question-answer.entity';

@Entity()
export class AnswerMultiChoiceEntity extends CommonEntity {
  @ManyToOne(() => QuestionAnswerEntity)
  questionAnswer: QuestionAnswerEntity;

  @Column()
  @Index()
  questionAnswerId: number;

  @Column()
  optionId: string;
}
