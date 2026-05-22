import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { KnexModule } from 'nestjs-knex';
import { RepositoriesModule } from './repositories/repositories.module';
import { HealthModule } from './entrypoints/health/health.module';
import { ItemsModule } from './entrypoints/items/items.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    KnexModule.forRoot({
      config: {
        client: 'pg',
        connection: {
          connectionString: process.env.DB_URI,
        },
        searchPath: [process.env.DB_SCHEMA || 'public', 'public'],
      },
    }),
    RepositoriesModule,
    HealthModule,
    ItemsModule,
  ],
})
export class AppModule {}
