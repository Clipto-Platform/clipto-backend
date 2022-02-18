import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request as NestRequest,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, VerifiedUser } from '@prisma/client';
import * as _ from 'ramda';
import { skip } from 'rxjs';
import { AppService } from './app.service';
import { CreateRequestDto } from './dto/CreateRequestDto';
import { CreateUserDto } from './dto/CreateUserDto';
import { FinishRequestDto } from './dto/FinishRequestDto';
import { RefundRequestDto } from './dto/RefundRequestDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { FinalizeUploadDto, UploadFileDto } from './dto/UploadRequestDto';
import { VerifyUserDto } from './dto/VerifyUser.dto';
import { Messages, NotificationGateway } from './gateway/notification.gateway';
import { BlockchainService } from './services/blockchain.service';
import { FileService } from './services/file.service';
import { RequestService } from './services/request.service';
import { UserService } from './services/user.service';
import { isRequestExpired } from './utils';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly blockchainService: BlockchainService,
    private readonly requestService: RequestService,
    private readonly fileService: FileService,
    private readonly notifService: NotificationGateway,
  ) {}
  
  @Get('users')
  public async getUsers(@Query('page') page: number, @Query('limit') limit : string): Promise<Array<VerifiedUser> | any> {
    const items = parseInt(limit);
    const result = await this.userService.users({take: items, skip: items*(page-1)});
    if (!result) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return result;
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

  @UseGuards(AuthGuard('web3'))
  @Post('user/create')
  public async create(@Body() createUserDto: CreateUserDto, @NestRequest() req) {
    const { address, tweetUrl } = createUserDto;
    const tweetResponse = await this.appService.verifyTwitter(tweetUrl, address);

    if (req.user.address !== address) {
      throw new HttpException('Signed message was from a different address!', HttpStatus.UNAUTHORIZED);
    }

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
      price: createUserDto.price,
    });
    return result;
  }

  @UseGuards(AuthGuard('web3'))
  @Put('user/:address')
  public async update(@Param('address') address: string, @Body() updateUserDto: UpdateUserDto, @NestRequest() req) {
    if (req.user.address !== address) {
      throw new HttpException('Signed message was from a different address!', HttpStatus.UNAUTHORIZED);
    }
    const existingUser = await this.userService.user({ address });
    if (!existingUser) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
    const result = await this.userService.updateUser({
      where: { address },
      data: {
        deliveryTime: updateUserDto.deliveryTime,
        bio: updateUserDto.bio,
        demos: updateUserDto.demos,
        price: updateUserDto.price,
        userName: updateUserDto.userName,
        profilePicture: updateUserDto.profilePicture,
      },
    });
    return result;
  }

  @UseGuards(AuthGuard('web3'))
  @Post('request/create')
  public async requestCreate(@Body() createRequestDto: CreateRequestDto) {
    if (
      await this.blockchainService.validateRequestTx(
        createRequestDto.txHash,
        createRequestDto.amount,
        createRequestDto.creator,
      )
    ) {
      this.notifService.notify(createRequestDto.creator, { message: Messages.NewRequest });
      return this.requestService.createRequest(_.omit(['message', 'address', 'signed'], createRequestDto));
    }
    throw new HttpException('Invalid associated TX hash!', HttpStatus.BAD_REQUEST);
  }

  @Get('request/receiver/:address')
  public async requestByReceiver(@Param('address') address: string): Promise<Request[]> {
    const result = await this.requestService.requests({ where: { requester: address }, orderBy: { created: 'desc' } });
    if (!result) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Get('request/creator/:address')
  public async requestByCreator(@Param('address') address: string): Promise<Request[]> {
    const result = await this.requestService.requests({ where: { creator: address }, orderBy: { created: 'desc' } });
    if (!result) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Get('request/creator/:address/:requestId')
  public async requestByCreatorAndRequestId(
    @Param('address') address: string,
    @Param('requestId') requestId: string,
  ): Promise<Request> {
    const result = await this.requestService.requests({ where: { creator: address, requestId: parseInt(requestId) } });
    if (!result) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    if (result[1]) {
      //if length has more than one entry, this should be unique and something is very wrong
      throw new HttpException('Hackers or bugs?', HttpStatus.NOT_FOUND);
    }
    return result[0];
  }

  @Post('request/refund')
  public async requestRefund(@Body() refundRequestDto: RefundRequestDto) {
    const result = await this.requestService.requests({ where: { id: refundRequestDto.id } });

    if (result.length !== 1) {
      throw new HttpException('Invalid request', HttpStatus.NOT_FOUND);
    }

    const request = result[0];
    if (!isRequestExpired(request.created, request.deadline)) {
      throw new HttpException('This order cannot be refunded', HttpStatus.BAD_REQUEST);
    }

    return this.requestService.updateRequest({ where: { id: refundRequestDto.id }, data: { refunded: true } });
  }

  @UseGuards(AuthGuard('web3'))
  @Post('request/finish')
  public async requestFinish(@Body() finishRequestDto: FinishRequestDto, @NestRequest() req) {
    const result = await this.requestService.requests({ where: { id: finishRequestDto.id } });

    if (result.length !== 1) {
      throw new HttpException('Invalid request', HttpStatus.NOT_FOUND);
    }

    const request = result[0];
    if (isRequestExpired(request.created, request.deadline)) {
      throw new HttpException('This order is expired', HttpStatus.BAD_REQUEST);
    }

    if (req.user.address !== request.creator) {
      throw new HttpException('Not a creator', HttpStatus.UNAUTHORIZED);
    }

    return this.requestService.updateRequest({ where: { id: finishRequestDto.id }, data: { delivered: true } });
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
}
