import { Column, Entity, Generated } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity()
export class SessionEntity extends CommonEntity {
  @Column({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true })
  token: string;

  @Column()
  surveyId: string;

  @Column()
  isCompleted: boolean;

  @Column({ nullable: true })
  nextQuestionId?: string;
}
