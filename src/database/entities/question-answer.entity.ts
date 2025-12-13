import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { CommonEntity } from './common.entity';
import { AnswerChoiceEntity } from './answer-choice.entity';
import { AnswerTextEntity } from './answer-text.entity';
import { SessionEntity } from './session.entity';

@Entity()
export class QuestionAnswerEntity extends CommonEntity {
  @ManyToOne(() => SessionEntity)
  session: SessionEntity;

  @Column()
  sessionId: number;

  @Column()
  questionId: string;

  @Column()
  submittedAt: Date;

  @OneToMany(
    () => AnswerChoiceEntity,
    (answerChoice) => answerChoice.questionAnswer,
  )
  answerChoices?: AnswerChoiceEntity[];

  @OneToOne(() => AnswerTextEntity, (answerText) => answerText.questionAnswer)
  answerText?: AnswerTextEntity;
}
