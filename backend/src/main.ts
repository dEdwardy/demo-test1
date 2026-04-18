import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8011',
      'http://localhost:30000',
      'http://localhost:8080',
    ],
    credentials: true,
  });

  // Serve static files from images directory
  app.useStaticAssets(join(__dirname, '..', 'data', 'images'), {
    prefix: '/api/images/',
  });

  // Serve static files from audio directory
  app.useStaticAssets(join(__dirname, '..', 'data', 'audio'), {
    prefix: '/api/audio/',
  });

  // Serve static files from project-files directory (for videos)
  app.useStaticAssets(join(__dirname, '..', 'project-files'), {
    prefix: '/api/videos/',
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📁 Images served from: http://localhost:${port}/api/images/`);
  console.log(`📁 Audio served from: http://localhost:${port}/api/audio/`);
  console.log(`🎬 Videos served from: http://localhost:${port}/api/videos/`);
}
bootstrap();
