import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 🛡️ Sécurité : Headers HTTP
  app.use(helmet());

  // 🛡️ Sécurité : CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // À restreindre en production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ Validation : Strict DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Retire les propriétés non décorées
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés inconnues
      transform: true, // Transforme les payloads en instances de DTO
    }),
  );

  // 🚫 Erreurs : Pas de stacktrace au client
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Préfixe API global
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  // Listen on 0.0.0.0 to accept connections from Android emulator (10.0.2.2)
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📱 Android Emulator can access via: http://10.0.2.2:${port}/api/v1`);
}
bootstrap();
