import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndex1765693196918 implements MigrationInterface {
    name = 'AddIndex1765693196918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_1876247cb625231c3edc8017ee" ON "answer_multi_choice_entity" ("questionAnswerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_19045c84316b1be21ee8fed258" ON "answer_single_choice_entity" ("questionAnswerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ffacff32319959855a0fe21b0a" ON "answer_text_entity" ("questionAnswerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d2a642ff4e8d60cf4ce745657b" ON "question_answer_entity" ("sessionId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d2a642ff4e8d60cf4ce745657b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ffacff32319959855a0fe21b0a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_19045c84316b1be21ee8fed258"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1876247cb625231c3edc8017ee"`);
    }

}
