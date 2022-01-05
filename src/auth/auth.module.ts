import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Web3Strategy } from './web3.strategy';

@Module({
  imports: [PassportModule],
  providers: [Web3Strategy],
})
export class AuthModule {}
