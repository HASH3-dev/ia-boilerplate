import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

dotenv.config({ path: '.env' });

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000'];

export function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function configureSecurity(app: INestApplication): void {
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
}

function buildSwagger(app: INestApplication) {
  if (process.env.NODE_ENV !== 'develop') return;

  const config = new DocumentBuilder()
    .setTitle('My Project API')
    .setDescription('REST API with Clean Architecture')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    yamlDocumentUrl: '/api/swagger.yaml',
    jsonDocumentUrl: '/api/swagger.json',
    swaggerOptions: { persistAuthorization: true },
  });
}

async function bootstrap() {
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);

  configureSecurity(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  buildSwagger(app);

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT || 3000}`);
  if (process.env.NODE_ENV === 'develop') {
    console.log(`Swagger docs: http://localhost:${process.env.PORT || 3000}/docs`);
  }
}

if (require.main === module) {
  void bootstrap();
}
