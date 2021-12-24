import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainService } from './services/blockchain.service';
import { PrismaService } from './services/prisma.service';
import { RequestService } from './services/request.service';
import { UserService } from './services/user.service';

@Module({
  controllers: [AppController],
  providers: [AppService, UserService, RequestService, BlockchainService, PrismaService],
})
export class AppModule {}
