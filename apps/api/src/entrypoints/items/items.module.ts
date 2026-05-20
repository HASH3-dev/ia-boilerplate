import { Module } from '@nestjs/common';
import { RepositoriesModule } from '@repositories/repositories.module';
import { ItemsController } from './adapters/rest/items.controller';
import { ListItemsHandler } from './use-cases/list-items/list-items.handler';
import { GetItemHandler } from './use-cases/get-item/get-item.handler';
import { CreateItemHandler } from './use-cases/create-item/create-item.handler';
import { UpdateItemHandler } from './use-cases/update-item/update-item.handler';
import { DeleteItemHandler } from './use-cases/delete-item/delete-item.handler';

@Module({
  imports: [RepositoriesModule],
  controllers: [ItemsController],
  providers: [
    ListItemsHandler,
    GetItemHandler,
    CreateItemHandler,
    UpdateItemHandler,
    DeleteItemHandler,
  ],
})
export class ItemsModule {}
