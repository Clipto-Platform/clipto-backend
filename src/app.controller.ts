import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request as NestRequest,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, VerifiedUser } from '@prisma/client';
import { AppService } from './app.service';
import { CreateRequestDto } from './dto/CreateRequestDto';
import { CreateUserDto } from './dto/CreateUserDto';
import { FinishRequestDto } from './dto/FinishRequestDto';
import { RefundRequestDto } from './dto/RefundRequestDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { VerifyUserDto } from './dto/VerifyUser.dto';
import { BlockchainService } from './services/blockchain.service';
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
  ) {}

  @Get('users')
  public async getUsers(): Promise<Array<VerifiedUser> | any> {
    const result = await this.userService.users({});
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
      },
    });
    return result;
  }

  @Post('request/create')
  public async requestCreate(@Body() createRequestDto: CreateRequestDto) {
    if (
      await this.blockchainService.validateRequestTx(
        createRequestDto.txHash,
        createRequestDto.amount,
        createRequestDto.creator,
      )
    ) {
      return this.requestService.createRequest(createRequestDto);
    }
    throw new HttpException('Invalid associated TX hash!', HttpStatus.BAD_REQUEST);
  }

  @Get('request/receiver/:address')
  public async requestByReceiver(@Param('address') address: string): Promise<Request[]> {
    const result = await this.requestService.requests({ where: { requester: address } });
    if (!result) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Get('request/creator/:address')
  public async requestByCreator(@Param('address') address: string): Promise<Request[]> {
    const result = await this.requestService.requests({ where: { creator: address } });
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

  @Post('request/finish')
  public async requestFinish(@Body() finishRequestDto: FinishRequestDto) {
    if (true) {
      return this.requestService.updateRequest({ where: { id: finishRequestDto.id }, data: { delivered: true } });
    }
    //throw new HttpException('Invalid associated TX hash!', HttpStatus.BAD_REQUEST);
  }
  //todo: request / profile updates, these have to be predecated against signTypedData_v4 from users, as well as checking the relevant TXes

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('asset'))
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   const uploadResult = await this.bundlr.uploader.upload(file.buffer, [
  //     {
  //       name: 'Content-Type',
  //       value: mime.lookup(file.originalname) || 'unknown',
  //     },
  //   ]);
  //   return { result: `ar://${uploadResult.data.id}` };
  // }
}
