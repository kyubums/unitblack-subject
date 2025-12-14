import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1765690544849 implements MigrationInterface {
    name = 'CreateTables1765690544849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session_entity" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "surveyId" character varying NOT NULL, "isCompleted" boolean NOT NULL, "nextQuestionId" character varying, CONSTRAINT "UQ_52d4247ddb7c7c14abf4c0c7438" UNIQUE ("uuid"), CONSTRAINT "UQ_aa53874cf4e3e4b63fd28f51641" UNIQUE ("token"), CONSTRAINT "PK_897bc09b92e1a7ef6b30cba4786" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answer_multi_choice_entity" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "questionAnswerId" integer NOT NULL, "optionId" character varying NOT NULL, CONSTRAINT "PK_1630e2be2c6ba52d1460d59f163" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answer_single_choice_entity" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "questionAnswerId" integer NOT NULL, "optionId" character varying NOT NULL, CONSTRAINT "REL_19045c84316b1be21ee8fed258" UNIQUE ("questionAnswerId"), CONSTRAINT "PK_ea9287ce3118b1fa93740d359b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answer_text_entity" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "questionAnswerId" integer NOT NULL, "text" character varying NOT NULL, CONSTRAINT "REL_ffacff32319959855a0fe21b0a" UNIQUE ("questionAnswerId"), CONSTRAINT "PK_73c088aaf2c25d91addef036903" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_answer_entity" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionId" integer NOT NULL, "questionId" character varying NOT NULL, "submittedAt" TIMESTAMP NOT NULL, "questionSnapshot" json NOT NULL, CONSTRAINT "PK_2f213a195cc88605a4e1ee253b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "answer_multi_choice_entity" ADD CONSTRAINT "FK_1876247cb625231c3edc8017eef" FOREIGN KEY ("questionAnswerId") REFERENCES "question_answer_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer_single_choice_entity" ADD CONSTRAINT "FK_19045c84316b1be21ee8fed2582" FOREIGN KEY ("questionAnswerId") REFERENCES "question_answer_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer_text_entity" ADD CONSTRAINT "FK_ffacff32319959855a0fe21b0a5" FOREIGN KEY ("questionAnswerId") REFERENCES "question_answer_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_answer_entity" ADD CONSTRAINT "FK_d2a642ff4e8d60cf4ce745657bd" FOREIGN KEY ("sessionId") REFERENCES "session_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_answer_entity" DROP CONSTRAINT "FK_d2a642ff4e8d60cf4ce745657bd"`);
        await queryRunner.query(`ALTER TABLE "answer_text_entity" DROP CONSTRAINT "FK_ffacff32319959855a0fe21b0a5"`);
        await queryRunner.query(`ALTER TABLE "answer_single_choice_entity" DROP CONSTRAINT "FK_19045c84316b1be21ee8fed2582"`);
        await queryRunner.query(`ALTER TABLE "answer_multi_choice_entity" DROP CONSTRAINT "FK_1876247cb625231c3edc8017eef"`);
        await queryRunner.query(`DROP TABLE "question_answer_entity"`);
        await queryRunner.query(`DROP TABLE "answer_text_entity"`);
        await queryRunner.query(`DROP TABLE "answer_single_choice_entity"`);
        await queryRunner.query(`DROP TABLE "answer_multi_choice_entity"`);
        await queryRunner.query(`DROP TABLE "session_entity"`);
    }

}
