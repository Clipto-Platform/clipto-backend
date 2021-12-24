import { IsEthereumAddress, IsNumber, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsEthereumAddress()
  requester: string;
  @IsEthereumAddress()
  creator: string;
  @IsNumber()
  amount: number;
  @IsString()
  description: string;
  @IsNumber()
  deadline: number;
  @IsString()
  txHash: string;
}
