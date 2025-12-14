import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionAnswerUniqKey1765692810347 implements MigrationInterface {
    name = 'AddQuestionAnswerUniqKey1765692810347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_answer_entity" ADD CONSTRAINT "uniq-question-answer" UNIQUE ("sessionId", "questionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_answer_entity" DROP CONSTRAINT "uniq-question-answer"`);
    }

}
