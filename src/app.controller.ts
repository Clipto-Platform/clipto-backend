import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinalizeUploadDto, UploadFileDto, TweetBody } from './dto/UploadFile.dto';
import { VerifyUserDto } from './dto/VerifyUser.dto';
import { SentryInterceptor } from './interceptor/sentry.interceptor';
import { FileService } from './services/file.service';
import { AppService } from './services/twitter.service';

@UseInterceptors(SentryInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly fileService: FileService) {}

  @Post('user/verify')
  public async verifyUser(@Body() verifyUserDto: VerifyUserDto) {
    const { address, tweetUrl } = verifyUserDto;
    return await this.appService.verifyTwitter(tweetUrl, address);
  }

  @Post('usersData')
  public async getTwitterData(@Body() users: string[]) {
    return await this.appService.getUsersTwiterData(users);
  }

  @UseGuards(AuthGuard('web3'))
  @Post('upload')
  async uploadFile(@Body() uploadFileDto: UploadFileDto) {
    return this.fileService.getUploadUrl(uploadFileDto.extension);
  }

  @Get('upload/status/:uploadUuid')
  async uploadFileStatus(@Param('uploadUuid') uploadUuid: string) {
    return this.fileService.getUploadStatus(uploadUuid);
  }

  @Post('upload/finalize')
  async uploadFileFinalize(@Body() data: FinalizeUploadDto) {
    return this.fileService.finalizeUpload(data);
  }

  @Post('tweet/create')
  async createTweet(@Body() data: any) {
    const { message, signature, tweetBody } = data
    return this.appService.createTweet(tweetBody, message, signature)
  }

  @Get('nonce')
  async generateNonce() {
    return this.appService.generateNonce();
  }
}
