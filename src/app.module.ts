import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainService } from './services/blockchain.service';
import { PrismaService } from './services/prisma.service';
import { RequestService } from './services/request.service';
import { UserService } from './services/user.service';
import { AuthModule } from './auth/auth.module';
import { FileService } from './services/file.service';

@Module({
  controllers: [AppController],
  providers: [AppService, UserService, RequestService, BlockchainService, FileService, PrismaService],
  imports: [AuthModule],
})
export class AppModule {}
