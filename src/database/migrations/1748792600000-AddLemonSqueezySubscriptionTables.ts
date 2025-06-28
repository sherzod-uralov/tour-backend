import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLemonSqueezySubscriptionTables1748792600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ls_subscription_plans table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ls_subscription_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        product_id INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        variant_id INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(255) NOT NULL,
        is_usage_based BOOLEAN DEFAULT false NOT NULL,
        interval VARCHAR(255),
        interval_count INTEGER,
        trial_interval VARCHAR(255),
        trial_interval_count INTEGER,
        sort INTEGER
      )
    `);

    // Create ls_user_subscriptions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ls_user_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        lemon_squeezy_id VARCHAR(255) UNIQUE NOT NULL,
        order_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        status_formatted VARCHAR(255) NOT NULL,
        renews_at VARCHAR(255),
        ends_at VARCHAR(255),
        trial_ends_at VARCHAR(255),
        price VARCHAR(255) NOT NULL,
        is_usage_based BOOLEAN DEFAULT false NOT NULL,
        is_paused BOOLEAN DEFAULT false NOT NULL,
        subscription_item_id VARCHAR(255),
        user_id INTEGER NOT NULL,
        plan_id UUID NOT NULL,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES ls_subscription_plans(id) ON DELETE CASCADE
      )
    `);

    // Create ls_webhook_events table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ls_webhook_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        processed BOOLEAN DEFAULT false NOT NULL,
        body JSONB NOT NULL,
        processing_error VARCHAR(255)
      )
    `);

    // Create extension if it doesn't exist
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryRunner.query(`DROP TABLE IF EXISTS ls_webhook_events`);
    await queryRunner.query(`DROP TABLE IF EXISTS ls_user_subscriptions`);
    await queryRunner.query(`DROP TABLE IF EXISTS ls_subscription_plans`);
  }
}