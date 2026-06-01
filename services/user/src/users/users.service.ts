import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthUser } from '@tikitu/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RegisterDto {
  cognitoId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(body: RegisterDto, authUser?: AuthUser) {
    const cognitoId = body.cognitoId || authUser?.sub;
    const { firstName, lastName, email, phone } = body;

    if (!cognitoId || !firstName || !lastName) {
      throw new BadRequestException(
        'Missing required fields: cognitoId (or auth token), firstName, lastName',
      );
    }

    const resolvedEmail = email || authUser?.email;
    if (!resolvedEmail) {
      throw new BadRequestException('Email is required');
    }

    const record = await this.prisma.user.upsert({
      where: { cognitoId },
      update: { firstName, lastName, phone },
      create: {
        cognitoId,
        email: resolvedEmail,
        firstName,
        lastName,
        phone,
      },
    });

    return {
      message: 'User registered successfully',
      data: record,
    };
  }

  async getProfile(cognitoId: string) {
    return this.prisma.user.findUnique({
      where: { cognitoId },
      include: { preferences: true, addresses: true },
    });
  }

  async resolveUserId(cognitoId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { cognitoId },
      select: { id: true },
    });
    return user?.id ?? null;
  }
}
