import { IsObject, IsString } from 'class-validator';

export class PinAddMetadata {
  @IsString()
  name: string;
  @IsObject()
  metadata: any;
}
