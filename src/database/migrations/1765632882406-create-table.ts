import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1765632882406 implements MigrationInterface {
    name = 'CreateTable1765632882406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "uuid" varchar NOT NULL, "token" varchar NOT NULL, "surveyId" varchar NOT NULL, "isCompleted" boolean NOT NULL, "nextQuestionId" varchar, CONSTRAINT "UQ_52d4247ddb7c7c14abf4c0c7438" UNIQUE ("uuid"), CONSTRAINT "UQ_aa53874cf4e3e4b63fd28f51641" UNIQUE ("token"))`);
        await queryRunner.query(`CREATE TABLE "answer_multi_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "answer_single_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL, CONSTRAINT "REL_19045c84316b1be21ee8fed258" UNIQUE ("questionAnswerId"))`);
        await queryRunner.query(`CREATE TABLE "answer_text_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "text" varchar NOT NULL, CONSTRAINT "REL_ffacff32319959855a0fe21b0a" UNIQUE ("questionAnswerId"))`);
        await queryRunner.query(`CREATE TABLE "question_answer_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "sessionId" integer NOT NULL, "questionId" varchar NOT NULL, "submittedAt" datetime NOT NULL, "questionSnapshot" json NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_answer_multi_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL, CONSTRAINT "FK_1876247cb625231c3edc8017eef" FOREIGN KEY ("questionAnswerId") REFERENCES "question_answer_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_answer_multi_choice_entity"("id", "createdAt", "updatedAt", "questionAnswerId", "optionId") SELECT "id", "createdAt", "updatedAt", "questionAnswerId", "optionId" FROM "answer_multi_choice_entity"`);
        await queryRunner.query(`DROP TABLE "answer_multi_choice_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_answer_multi_choice_entity" RENAME TO "answer_multi_choice_entity"`);
        await queryRunner.query(`CREATE TABLE "temporary_answer_single_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL, CONSTRAINT "REL_19045c84316b1be21ee8fed258" UNIQUE ("questionAnswerId"), CONSTRAINT "FK_19045c84316b1be21ee8fed2582" FOREIGN KEY ("questionAnswerId") REFERENCES "question_answer_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_answer_single_choice_entity"("id", "createdAt", "updatedAt", "questionAnswerId", "optionId") SELECT "id", "createdAt", "updatedAt", "questionAnswerId", "optionId" FROM "answer_single_choice_entity"`);
        await queryRunner.query(`DROP TABLE "answer_single_choice_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_answer_single_choice_entity" RENAME TO "answer_single_choice_entity"`);
        await queryRunner.query(`CREATE TABLE "temporary_answer_text_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "text" varchar NOT NULL, CONSTRAINT "REL_ffacff32319959855a0fe21b0a" UNIQUE ("questionAnswerId"), CONSTRAINT "FK_ffacff32319959855a0fe21b0a5" FOREIGN KEY ("questionAnswerId") REFERENCES "question_answer_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_answer_text_entity"("id", "createdAt", "updatedAt", "questionAnswerId", "text") SELECT "id", "createdAt", "updatedAt", "questionAnswerId", "text" FROM "answer_text_entity"`);
        await queryRunner.query(`DROP TABLE "answer_text_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_answer_text_entity" RENAME TO "answer_text_entity"`);
        await queryRunner.query(`CREATE TABLE "temporary_question_answer_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "sessionId" integer NOT NULL, "questionId" varchar NOT NULL, "submittedAt" datetime NOT NULL, "questionSnapshot" json NOT NULL, CONSTRAINT "FK_d2a642ff4e8d60cf4ce745657bd" FOREIGN KEY ("sessionId") REFERENCES "session_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_question_answer_entity"("id", "createdAt", "updatedAt", "sessionId", "questionId", "submittedAt", "questionSnapshot") SELECT "id", "createdAt", "updatedAt", "sessionId", "questionId", "submittedAt", "questionSnapshot" FROM "question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "question_answer_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_question_answer_entity" RENAME TO "question_answer_entity"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_answer_entity" RENAME TO "temporary_question_answer_entity"`);
        await queryRunner.query(`CREATE TABLE "question_answer_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "sessionId" integer NOT NULL, "questionId" varchar NOT NULL, "submittedAt" datetime NOT NULL, "questionSnapshot" json NOT NULL)`);
        await queryRunner.query(`INSERT INTO "question_answer_entity"("id", "createdAt", "updatedAt", "sessionId", "questionId", "submittedAt", "questionSnapshot") SELECT "id", "createdAt", "updatedAt", "sessionId", "questionId", "submittedAt", "questionSnapshot" FROM "temporary_question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_question_answer_entity"`);
        await queryRunner.query(`ALTER TABLE "answer_text_entity" RENAME TO "temporary_answer_text_entity"`);
        await queryRunner.query(`CREATE TABLE "answer_text_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "text" varchar NOT NULL, CONSTRAINT "REL_ffacff32319959855a0fe21b0a" UNIQUE ("questionAnswerId"))`);
        await queryRunner.query(`INSERT INTO "answer_text_entity"("id", "createdAt", "updatedAt", "questionAnswerId", "text") SELECT "id", "createdAt", "updatedAt", "questionAnswerId", "text" FROM "temporary_answer_text_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_answer_text_entity"`);
        await queryRunner.query(`ALTER TABLE "answer_single_choice_entity" RENAME TO "temporary_answer_single_choice_entity"`);
        await queryRunner.query(`CREATE TABLE "answer_single_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL, CONSTRAINT "REL_19045c84316b1be21ee8fed258" UNIQUE ("questionAnswerId"))`);
        await queryRunner.query(`INSERT INTO "answer_single_choice_entity"("id", "createdAt", "updatedAt", "questionAnswerId", "optionId") SELECT "id", "createdAt", "updatedAt", "questionAnswerId", "optionId" FROM "temporary_answer_single_choice_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_answer_single_choice_entity"`);
        await queryRunner.query(`ALTER TABLE "answer_multi_choice_entity" RENAME TO "temporary_answer_multi_choice_entity"`);
        await queryRunner.query(`CREATE TABLE "answer_multi_choice_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionAnswerId" integer NOT NULL, "optionId" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "answer_multi_choice_entity"("id", "createdAt", "updatedAt", "questionAnswerId", "optionId") SELECT "id", "createdAt", "updatedAt", "questionAnswerId", "optionId" FROM "temporary_answer_multi_choice_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_answer_multi_choice_entity"`);
        await queryRunner.query(`DROP TABLE "question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "answer_text_entity"`);
        await queryRunner.query(`DROP TABLE "answer_single_choice_entity"`);
        await queryRunner.query(`DROP TABLE "answer_multi_choice_entity"`);
        await queryRunner.query(`DROP TABLE "session_entity"`);
    }

}
