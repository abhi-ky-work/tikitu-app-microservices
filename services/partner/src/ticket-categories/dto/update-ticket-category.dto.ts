import { TicketCategoryCode } from '../../../prisma/generated/client';

export class UpdateTicketCategoryDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}
