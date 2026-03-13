import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfigService } from './common/config/app-config.service';
import expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(AppConfigService);

  app.useStaticAssets(join(__dirname, '..', 'public', 'ws-test.html'));

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  if (configService.nodeEnv === 'production') {
    app.use(
      ['/api', '/api-json'],
      expressBasicAuth({
        challenge: true,
        users: {
          [configService.swaggerUser]: configService.swaggerPassword,
        },
      }),
    );
  }

  app.useGlobalFilters(new GlobalExceptionFilter(configService));
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Standup Platform API')
    .setDescription('Async Daily Standup API')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(configService.port);
}

async function startApp() {
  try {
    await bootstrap();
  } catch (err) {
    console.error('Error during bootstrap', err);
    process.exit(1);
  }
}

void startApp();
