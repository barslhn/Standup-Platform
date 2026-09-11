import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfigService } from './common/config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(AppConfigService);

  app.setGlobalPrefix('api');

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.enableCors({
    origin: configService.frontendUrl,
    credentials: true,
  });

  if (configService.nodeEnv === 'production') {
    app.use(
      ['/api/docs', '/api/docs-json'],
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

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.port);
}

async function startApp() {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Error during bootstrap', error);
    process.exit(1);
  }
}

void startApp();