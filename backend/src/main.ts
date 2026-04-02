// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const dbHost = configService.get('DB_HOST');
  console.log(`📡 Current Database Host: ${dbHost || 'localhost'}`);
  
  app.setGlobalPrefix('api/v1');
  
  // Robust CORS configuration for Production & Local Dev
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://50.16.16.127:3000',
      'http://50.16.16.127', // Root IP
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Restaurant Management API')
    .setDescription('Multi-location restaurant ordering system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  
  const host = configService.get('NODE_ENV') === 'production' ? '50.16.16.127' : 'localhost';
  console.log(`🚀 Restaurant API running on http://${host}:${port}/api/v1`);
  console.log(`📚 Swagger docs at http://${host}:${port}/api/docs`);
}
bootstrap();
