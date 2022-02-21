import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { PrismaService } from './services/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  Sentry.init({
    dsn: process.env.SENTRY_DNS,
    enabled: process.env.NODE_ENV === 'production',
    debug: true,
  });

  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);
  await app.listen(8000);
}
bootstrap();
