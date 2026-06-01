import { TicketCategoryCode } from '../../../prisma/generated/client';

export class CreateTicketCategoryDto {
  categoryCode: TicketCategoryCode;
  name: string;
  description?: string;
  isActive?: boolean;
}
