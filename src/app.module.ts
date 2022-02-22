import { Module } from '@nestjs/common';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlockchainService } from './services/blockchain.service';
import { FileService } from './services/file.service';
import { PrismaService } from './services/prisma.service';
import { RequestService } from './services/request.service';
import { UserService } from './services/user.service';

@Module({
  controllers: [AppController],
  providers: [AppService, UserService, RequestService, BlockchainService, FileService, PrismaService],
  imports: [
    GoogleRecaptchaModule.forRoot({
      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
      response: (req) => (req.headers.recaptcha || '').toString(),
      actions: ['Booking', 'Upload', 'Onboard', 'UpdateProfile', 'Refund', 'CompleteRequest'],
      score: 0.8,
    }),
    AuthModule,
  ],
})
export class AppModule {}
