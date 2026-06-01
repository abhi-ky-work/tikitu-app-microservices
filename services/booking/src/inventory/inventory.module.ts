import { Module } from '@nestjs/common';
import { InternalApiKeyGuard } from '@tikitu/common';
import { SearchModule } from '../search/search.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [SearchModule],
  controllers: [InventoryController],
  providers: [InventoryService, InternalApiKeyGuard],
  exports: [InventoryService],
})
export class InventoryModule {}
