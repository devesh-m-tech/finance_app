import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 4000);
  const corsOrigins = configService.get<string[]>('cors.origins', []);

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Strict CORS Allow-List
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    })
  );

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Shri Amudha Small Finance - LMS API')
    .setDescription(
      'Enterprise Loan Management System for Daily, Weekly, Monthly, Vehicle, and Metal Lending'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`🚀 Shri Amudha LMS Backend running on http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger API Documentation available on http://localhost:${port}/docs`);
}

bootstrap();
