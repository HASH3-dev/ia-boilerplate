import { Module } from '@nestjs/common';
import { ItemRepository } from './item/item.repository';

@Module({
  providers: [ItemRepository],
  exports: [ItemRepository],
})
export class RepositoriesModule {}
