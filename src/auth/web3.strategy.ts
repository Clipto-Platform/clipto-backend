import { Strategy } from 'passport-dapp-web3';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class Web3Strategy extends PassportStrategy(Strategy) { //TODO(jonathanng) - make message signing be correct wording updating and creating requests
  messageToBeSigned = 'I am onboarding to Clipto';

  constructor() {
    super();
  }

  async validate(address: string, message: string): Promise<any> {
    if (message !== this.messageToBeSigned) {
      throw new HttpException('Incorrect message signed!', HttpStatus.UNAUTHORIZED);
    }
    return { address };
  }
}
