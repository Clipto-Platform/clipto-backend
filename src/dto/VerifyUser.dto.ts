import { IsEthereumAddress, IsUrl } from 'class-validator';

export class VerifyUserDto {
  @IsUrl()
  tweetUrl: string;
  @IsEthereumAddress()
  address: string;
}
