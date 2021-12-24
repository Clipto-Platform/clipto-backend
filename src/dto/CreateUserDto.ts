import { IsArray, IsEthereumAddress, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsEthereumAddress()
  address: string;
  @IsString()
  bio: string;
  @IsNumber()
  deliveryTime: number;
  @IsArray()
  demos: string[];
  @IsUrl()
  profilePicture: string;
  @IsUrl()
  tweetUrl: string;
  @IsString()
  userName: string;
}
