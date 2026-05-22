import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { HealthController } from './health.controller';
import { CheckHealthHandler } from '../../use-cases/check-health/check-health.handler';

describe('[smoke] HealthController contract', () => {
  let app: INestApplication;
  let handleMock: jest.Mock;

  beforeEach(async () => {
    handleMock = jest.fn().mockReturnValue({ status: 'ok' });

    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: CheckHealthHandler,
          useValue: { handle: handleMock },
        },
        {
          provide: APP_GUARD,
          useValue: { canActivate: () => true },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health returns 200 { status: "ok" }', async () => {
    const response = await supertest(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('delegates to CheckHealthHandler.handle() once', async () => {
    await supertest(app.getHttpServer()).get('/health');
    expect(handleMock).toHaveBeenCalledTimes(1);
  });
});
