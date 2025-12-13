import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from './common.entity';
import { QuestionAnswerEntity } from './question-answer.entity';

@Entity()
export class AnswerMultiChoiceEntity extends CommonEntity {
  @ManyToOne(() => QuestionAnswerEntity)
  questionAnswer: QuestionAnswerEntity;

  @Column()
  questionAnswerId: number;

  @Column()
  optionId: string;
}
