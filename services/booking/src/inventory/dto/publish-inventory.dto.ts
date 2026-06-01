export class PublishInventoryDto {
  catalogEventId!: string;
  partnerId!: string;
  venueId!: string;
  city!: string;
  title!: string;
  description?: string | null;
  eventDate!: string;
  startTime!: string;
  endTime!: string;
  category!: string;
  totalSeats!: number;
  basePrice!: number;
  imageUrl?: string | null;
  ticketSalesClose?: string | null;
  noteToAttendees?: string | null;
  termsConditions?: string | null;
  refundPolicy?: string | null;
}
