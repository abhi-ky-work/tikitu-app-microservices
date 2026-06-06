import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  LocationClient,
  SearchPlaceIndexForSuggestionsCommand,
  GetPlaceCommand,
} from '@aws-sdk/client-location';

@Injectable()
export class EventVenuesService {
  private readonly logger = new Logger(EventVenuesService.name);
  private readonly locationClient: LocationClient;
  private readonly placeIndexName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.locationClient = new LocationClient({
      region: 
        this.configService.get<string>('AWS_LOCATION_REGION') || 
        this.configService.get<string>('AWS_REGION') || 
        'us-east-1',
    });
    this.placeIndexName =
      this.configService.get<string>('AWS_LOCATION_PLACE_INDEX_NAME') || 'TikituPlaceIndex';
  }

  async autocomplete(text: string) {
    if (!text || text.length < 3) return [];
    try {
      const command = new SearchPlaceIndexForSuggestionsCommand({
        IndexName: this.placeIndexName,
        Text: text,
        MaxResults: 5,
        FilterCountries: ['IND'], // Restrict to India or remove as needed
      });
      const response = await this.locationClient.send(command);
      return response.Results || [];
    } catch (error: any) {
      this.logger.error('Error fetching AWS Place API autocomplete', error);
      throw new InternalServerErrorException(`Failed to fetch address suggestions: ${error.message}`);
    }
  }

  async getPlaceDetails(placeId: string) {
    try {
      const command = new GetPlaceCommand({
        IndexName: this.placeIndexName,
        PlaceId: placeId,
      });
      const response = await this.locationClient.send(command);
      return response.Place;
    } catch (error: any) {
      this.logger.error('Error fetching AWS Place API details', error);
      throw new InternalServerErrorException(`Failed to fetch address details: ${error.message}`);
    }
  }

  async createEventVenue(cognitoId: string, data: any) {
    const partner = await this.prisma.partner.findUnique({
      where: { cognitoId },
    });
    if (!partner) {
      throw new InternalServerErrorException('Partner not found');
    }
    return this.prisma.eventVenues.create({
      data: {
        ...data,
        partnerId: partner.id,
      },
    });
  }

  async getEventVenues(cognitoId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { cognitoId },
    });
    if (!partner) return [];
    return this.prisma.eventVenues.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
