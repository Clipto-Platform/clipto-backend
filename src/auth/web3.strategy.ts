import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-dapp-web3';

@Injectable()
export class Web3Strategy extends PassportStrategy(Strategy) {
  //TODO(jonathanng) - make message signing be correct wording updating and creating requests
  messages = [
    'I am onboarding to Clipto',
    'I am updating my profile in Clipto',
    'I am creating a booking for my creator',
    'I am uploading a video to complete the Order',
    'I am completing an order',
    'I am initiating refund',
  ];

  constructor() {
    super();
  }

  async validate(address: string, message: string): Promise<any> {
    if (this.messages.includes(message)) {
      return { address };
    }

    throw new HttpException('Incorrect message signed!', HttpStatus.UNAUTHORIZED);
  }
}
