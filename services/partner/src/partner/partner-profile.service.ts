import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '@tikitu/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartnerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async savePartnerProfileDetails(
    user: AuthUser,
    body: { name?: string; companyName?: string; phone?: string; email?: string },
  ) {
    const { name, companyName, phone, email } = body;

    if (!name || !companyName || !phone) {
      throw new BadRequestException('Missing required fields: name, companyName, or phone');
    }

    const cognitoId = user.sub;

    const partnerProfile = await this.prisma.partner.upsert({
      where: { cognitoId },
      update: { name, companyName, phone },
      create: {
        cognitoId,
        email: email || user.email || 'no-reply@example.com',
        name,
        companyName,
        phone,
        isVerified: false,
        isActive: true,
      },
    });

    return {
      message: 'Partner profile saved successfully',
      data: partnerProfile,
    };
  }

  /** Resolve Partner.id from Cognito sub — use for all cross-service references. */
  async resolvePartnerId(cognitoId: string): Promise<string> {
    const partner = await this.prisma.partner.findUnique({
      where: { cognitoId },
      select: { id: true },
    });
    if (!partner) {
      throw new NotFoundException(
        'Partner profile not found. Complete partner onboarding first.',
      );
    }
    return partner.id;
  }

  async getPartnerByCognitoId(cognitoId: string) {
    return this.prisma.partner.findUnique({ where: { cognitoId } });
  }
}
