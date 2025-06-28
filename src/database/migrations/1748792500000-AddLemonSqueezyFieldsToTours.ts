import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLemonSqueezyFieldsToTours1748792500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tours
      ADD COLUMN IF NOT EXISTS lemon_squeezy_product_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS lemon_squeezy_variant_id VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tours
      DROP COLUMN IF EXISTS lemon_squeezy_product_id,
      DROP COLUMN IF EXISTS lemon_squeezy_variant_id
    `);
  }
}
