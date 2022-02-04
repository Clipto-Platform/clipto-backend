import { IsArray, IsNumber, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  bio: string;
  @IsNumber()
  deliveryTime: number;
  @IsArray()
  demos: string[];
  @IsString()
  userName: string;
  @IsNumber()
  price: number;
  @IsUrl()
  profilePicture: string;
}
