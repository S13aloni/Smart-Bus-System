import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Smart Bus Optimization API')
    .setDescription('API for Smart Bus Optimization System - Real-time tracking, demand prediction, and schedule optimization')
    .setVersion('1.0')
    .addTag('buses', 'Bus tracking and management')
    .addTag('routes', 'Route information and management')
    .addTag('schedules', 'Schedule optimization and management')
    .addTag('demand', 'Demand prediction and analysis')
    .addTag('passengers', 'Passenger count and occupancy data')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`Smart Bus Backend API running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api`);
}

bootstrap();

