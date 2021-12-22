import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { VerifiedUser, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.VerifiedUserWhereUniqueInput,
  ): Promise<VerifiedUser | null> {
    return this.prisma.verifiedUser.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.VerifiedUserWhereUniqueInput;
    where?: Prisma.VerifiedUserWhereInput;
    orderBy?: Prisma.VerifiedUserOrderByWithRelationInput;
  }): Promise<VerifiedUser[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.verifiedUser.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(
    data: Prisma.VerifiedUserCreateInput,
  ): Promise<VerifiedUser> {
    return this.prisma.verifiedUser.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.VerifiedUserWhereUniqueInput;
    data: Prisma.VerifiedUserUpdateInput;
  }): Promise<VerifiedUser> {
    const { where, data } = params;
    return this.prisma.verifiedUser.update({
      data,
      where,
    });
  }

  async deleteUser(
    where: Prisma.VerifiedUserWhereUniqueInput,
  ): Promise<VerifiedUser> {
    return this.prisma.verifiedUser.delete({
      where,
    });
  }
}
