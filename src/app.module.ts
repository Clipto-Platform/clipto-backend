import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './services/prisma.service';
import { UserService } from './services/user.service';

@Module({
  controllers: [AppController],
  providers: [AppService, UserService, PrismaService],
})
export class AppModule {}
