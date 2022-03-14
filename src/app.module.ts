import { Module } from '@nestjs/common';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FileService } from './services/file.service';

@Module({
  controllers: [AppController],
  providers: [AppService, FileService],
  imports: [
    GoogleRecaptchaModule.forRoot({
      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
      response: (req) => (req.headers.recaptcha || '').toString(),
      actions: ['Upload'],
      score: 0.8,
    }),
    AuthModule,
  ],
})
export class AppModule {}
