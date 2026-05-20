import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DB_URI,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
  },
};

export default config;
