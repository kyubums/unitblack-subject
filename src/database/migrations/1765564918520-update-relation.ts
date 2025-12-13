import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRelation1765564918520 implements MigrationInterface {
    name = 'UpdateRelation1765564918520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_question_answer_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionId" varchar NOT NULL, "submittedAt" datetime NOT NULL, "sessionId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_question_answer_entity"("id", "createdAt", "updatedAt", "questionId", "submittedAt") SELECT "id", "createdAt", "updatedAt", "questionId", "submittedAt" FROM "question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "question_answer_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_question_answer_entity" RENAME TO "question_answer_entity"`);
        await queryRunner.query(`CREATE TABLE "temporary_session_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "uuid" varchar NOT NULL, "token" varchar NOT NULL, "surveyId" varchar NOT NULL, "isCompleted" boolean NOT NULL, "nextQuestionId" varchar, CONSTRAINT "UQ_7d6d5d057ec32fee75ffe57436b" UNIQUE ("uuid"), CONSTRAINT "UQ_39a5d11891ff5102fd0d8f9ec7e" UNIQUE ("token"))`);
        await queryRunner.query(`INSERT INTO "temporary_session_entity"("id", "createdAt", "updatedAt", "uuid", "token", "surveyId", "isCompleted", "nextQuestionId") SELECT "id", "createdAt", "updatedAt", "uuid", "token", "surveyId", "isCompleted", "nextQuestionId" FROM "session_entity"`);
        await queryRunner.query(`DROP TABLE "session_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_session_entity" RENAME TO "session_entity"`);
        await queryRunner.query(`CREATE TABLE "temporary_question_answer_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionId" varchar NOT NULL, "submittedAt" datetime NOT NULL, "sessionId" integer NOT NULL, CONSTRAINT "FK_d2a642ff4e8d60cf4ce745657bd" FOREIGN KEY ("sessionId") REFERENCES "session_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_question_answer_entity"("id", "createdAt", "updatedAt", "questionId", "submittedAt", "sessionId") SELECT "id", "createdAt", "updatedAt", "questionId", "submittedAt", "sessionId" FROM "question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "question_answer_entity"`);
        await queryRunner.query(`ALTER TABLE "temporary_question_answer_entity" RENAME TO "question_answer_entity"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_answer_entity" RENAME TO "temporary_question_answer_entity"`);
        await queryRunner.query(`CREATE TABLE "question_answer_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionId" varchar NOT NULL, "submittedAt" datetime NOT NULL, "sessionId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "question_answer_entity"("id", "createdAt", "updatedAt", "questionId", "submittedAt", "sessionId") SELECT "id", "createdAt", "updatedAt", "questionId", "submittedAt", "sessionId" FROM "temporary_question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_question_answer_entity"`);
        await queryRunner.query(`ALTER TABLE "session_entity" RENAME TO "temporary_session_entity"`);
        await queryRunner.query(`CREATE TABLE "session_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "uuid" varchar NOT NULL, "token" varchar NOT NULL, "surveyId" varchar NOT NULL, "isCompleted" boolean NOT NULL, "nextQuestionId" varchar)`);
        await queryRunner.query(`INSERT INTO "session_entity"("id", "createdAt", "updatedAt", "uuid", "token", "surveyId", "isCompleted", "nextQuestionId") SELECT "id", "createdAt", "updatedAt", "uuid", "token", "surveyId", "isCompleted", "nextQuestionId" FROM "temporary_session_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_session_entity"`);
        await queryRunner.query(`ALTER TABLE "question_answer_entity" RENAME TO "temporary_question_answer_entity"`);
        await queryRunner.query(`CREATE TABLE "question_answer_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "questionId" varchar NOT NULL, "submittedAt" datetime NOT NULL)`);
        await queryRunner.query(`INSERT INTO "question_answer_entity"("id", "createdAt", "updatedAt", "questionId", "submittedAt") SELECT "id", "createdAt", "updatedAt", "questionId", "submittedAt" FROM "temporary_question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "temporary_question_answer_entity"`);
    }

}
