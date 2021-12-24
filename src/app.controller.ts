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
import { AppService } from './app.service';
import { VerifyUserDto } from './dto/VerifyUser.dto';
import { UserService } from './services/user.service';
import * as fs from 'fs';
import { Bundlr } from '@bundlr-network/client';
import * as mime from 'mime-types';
import { CreateUserDto } from './dto/CreateUserDto';
import { CreateRequestDto } from './dto/CreateRequestDto';
import { RequestService } from './services/request.service';
import { BlockchainService } from './services/blockchain.service';

@Controller()
export class AppController {
  bundlr: Bundlr;

  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly blockchainService: BlockchainService,
    private readonly requestService: RequestService,
  ) {
    const jwk = JSON.parse(fs.readFileSync('wallet.json').toString());
    this.bundlr = new Bundlr('https://node1.bundlr.network/', 'arweave', jwk);
  }

  @Get('user/:address')
  public async getUser(@Param('address') address: string): Promise<VerifiedUser | any> {
    const result = await this.userService.user({ address });
    if (!result) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Post('user/verify')
  public async verifyUser(@Body() verifyUserDto: VerifyUserDto) {
    const { address, tweetUrl } = verifyUserDto;
    return await this.appService.verifyTwitter(tweetUrl, address);
  }

  @Post('user/create')
  public async create(@Body() createUserDto: CreateUserDto) {
    const { address, tweetUrl } = createUserDto;
    const tweetResponse = await this.appService.verifyTwitter(tweetUrl, address);

    const existingUser = await this.userService.user({ address });
    if (existingUser) {
      throw new HttpException('User already created!', HttpStatus.BAD_REQUEST);
    }
    const result = await this.userService.createUser({
      twitterHandle: tweetResponse.includes.users[0].username,
      address,
      profilePicture: createUserDto.profilePicture,
      deliveryTime: createUserDto.deliveryTime,
      bio: createUserDto.bio,
      demos: createUserDto.demos,
      userName: createUserDto.userName,
    });
    return result;
  }

  @Post('request/create')
  public async requestCreate(@Body() createRequestDto: CreateRequestDto) {
    const result = await this.blockchainService.validateRequestTx(
      createRequestDto.txHash,
      createRequestDto.amount.toString(),
      createRequestDto.requester,
    );
    console.log(result);
    return this.requestService.createRequest(createRequestDto);
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
