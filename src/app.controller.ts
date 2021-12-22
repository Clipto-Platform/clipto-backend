import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerifiedUser } from '@prisma/client';
import { TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';
import { AppService } from './app.service';
import { VerifyUserDto } from './dto/VerifyUser.dto';
import { UserService } from './services/user.service';
import * as fs from 'fs';
import { Bundlr } from '@bundlr-network/client';
import * as mime from 'mime-types';

@Controller()
export class AppController {
  twitterClient: TwitterApiReadOnly;
  bundlr: Bundlr;

  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {
    this.twitterClient = new TwitterApi(process.env.TWITTER_KEY).readOnly;
    const jwk = JSON.parse(fs.readFileSync('wallet.json').toString());
    this.bundlr = new Bundlr('https://node1.bundlr.network/', 'arweave', jwk);
  }

  @Get('user/:address')
  public async getUser(
    @Param('address') address: string,
  ): Promise<VerifiedUser | any> {
    const result = await this.userService.user({ address });
    if (!result) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Post('user/verify')
  public async verifyUser(@Body() verifyUserDto: VerifyUserDto) {
    const { address, tweetUrl } = verifyUserDto;
    const tweetId = tweetUrl.replace(/\/$/, '').split('/').pop();

    const tweetResponse = await this.twitterClient.v2.singleTweet(tweetId, {
      'tweet.fields': ['author_id', 'lang', 'text', 'created_at'],
      'user.fields': ['name', 'username', 'profile_image_url'],
      expansions: ['author_id'],
    });

    if (
      tweetResponse.data.text.indexOf(address) !== -1 &&
      tweetResponse.data.text.toLocaleLowerCase().indexOf('@cliptodao') !== -1
    ) {
      const twitterHandle = tweetResponse.includes.users[0].username;
      // create the user
      await this.userService.createUser({ address, twitterHandle });
      // return the twitter response so we can bundle the user's profile image on the frontend
      return tweetResponse;
    }
    throw new HttpException('Invalid tweet', HttpStatus.BAD_REQUEST);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('asset'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const uploadResult = await this.bundlr.uploader.upload(file.buffer, [
      {
        name: 'Content-Type',
        value: mime.lookup(file.originalname) || 'unknown',
      },
    ]);
    return { result: `ar://${uploadResult.data.id}` };
  }
}
