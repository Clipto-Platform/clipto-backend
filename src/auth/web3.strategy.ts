import { Strategy } from 'passport-dapp-web3';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class Web3Strategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  async validate(address: string, message: string): Promise<any> {
    if (message !== 'I am onboarding to Clipto') {
      throw new HttpException('Incorrect message signed!', HttpStatus.UNAUTHORIZED);
    }
    return { address };
  }
}
