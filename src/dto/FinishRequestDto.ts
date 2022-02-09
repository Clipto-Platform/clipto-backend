import { IsString, IsNumber } from 'class-validator';

export class FinishRequestDto {
  @IsNumber()
  id: number;
  @IsString()
  address: string;
  @IsString()
  message: string;
  @IsString()
  signed: string;
}
