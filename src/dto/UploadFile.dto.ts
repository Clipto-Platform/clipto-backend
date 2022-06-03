import { IsString } from 'class-validator';

export class UploadFileDto {
  @IsString()
  extension: string;
}

export class UploadUuidDto {
  @IsString()
  uploadUuid: string;
}

export class FinalizeUploadDto {
  @IsString()
  uploadUuid: string;
  @IsString()
  name: string;
  @IsString()
  description: string;
}

export class TweetBody {
  tweetBody: string;
  message: string;
  signature: string
}