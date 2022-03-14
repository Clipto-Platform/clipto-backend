import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FileService } from './services/file.service';

@Module({
  controllers: [AppController],
  providers: [AppService, FileService],
  imports: [ConfigModule.forRoot(), AuthModule],
})
export class AppModule {}
