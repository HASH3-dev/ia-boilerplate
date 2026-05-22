import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Anonymous } from '@shared/decorators/anonymous.decorator';
import { CheckHealthHandler } from '../../use-cases/check-health/check-health.handler';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly checkHealthHandler: CheckHealthHandler) {}

  @Anonymous()
  @Get()
  @ApiOperation({ operationId: 'health', summary: 'Health check' })
  check(): { status: string } {
    return this.checkHealthHandler.handle();
  }
}
