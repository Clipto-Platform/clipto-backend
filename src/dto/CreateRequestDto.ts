import { IsEthereumAddress, IsNumber, IsNumberString, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsNumber()
  requestId: number;
  @IsEthereumAddress()
  requester: string;
  @IsEthereumAddress()
  creator: string;
  @IsNumberString()
  amount: string;
  @IsString()
  description: string;
  @IsNumber()
  deadline: number;
  @IsString()
  txHash: string;
}
