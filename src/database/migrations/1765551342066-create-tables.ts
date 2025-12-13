import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1765551342066 implements MigrationInterface {
    name = 'CreateTables1765551342066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "answer_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "answer_text_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "text" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "question_answer_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionId" varchar NOT NULL, "submittedAt" datetime NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "session_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "uuid" varchar NOT NULL, "token" varchar NOT NULL, "surveyId" varchar NOT NULL, "isCompleted" boolean NOT NULL, "nextQuestionId" varchar)`);
        await queryRunner.query(`CREATE TABLE "temporary_answer_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL, CONSTRAINT "FK_b1babef7ff6e2c2bd4609888da4" FOREIGN KEY ("questionAnswerId") REFERENCES "question_answer_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_answer_choice_entity"("id", "createdAt", "updatedAt", "questionAnswerId", "optionId") SELECT "id", "createdAt", "updatedAt", "questionAnswerId", "optionId" FROM "answer_choice_entity"`);
        await queryRunner.query(`DROP TABLE "answer_choice_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_answer_choice_entity" RENAME TO "answer_choice_entity"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer_choice_entity" RENAME TO "temporary_answer_choice_entity"`);
        await queryRunner.query(`CREATE TABLE "answer_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "answer_choice_entity"("id", "createdAt", "updatedAt", "questionAnswerId", "optionId") SELECT "id", "createdAt", "updatedAt", "questionAnswerId", "optionId" FROM "temporary_answer_choice_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_answer_choice_entity"`);
        await queryRunner.query(`DROP TABLE "session_entity"`);
        await queryRunner.query(`DROP TABLE "question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "answer_text_entity"`);
        await queryRunner.query(`DROP TABLE "answer_choice_entity"`);
    }

}
