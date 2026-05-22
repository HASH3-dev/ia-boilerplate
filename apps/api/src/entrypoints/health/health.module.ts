import { Module } from '@nestjs/common';
import { HealthController } from './adapters/rest/health.controller';
import { CheckHealthHandler } from './use-cases/check-health/check-health.handler';

@Module({
  controllers: [HealthController],
  providers: [CheckHealthHandler],
})
export class HealthModule {}
