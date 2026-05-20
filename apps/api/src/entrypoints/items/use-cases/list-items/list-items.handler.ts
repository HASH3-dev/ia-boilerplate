import { Injectable } from '@nestjs/common';
import { ItemRepository } from '@repositories/item/item.repository';
import { ItemResponseDto } from '@entrypoints/items/dto/item.response.dto';

@Injectable()
export class ListItemsHandler {
  constructor(private readonly itemRepository: ItemRepository) {}

  async handle(): Promise<ItemResponseDto[]> {
    const items = await this.itemRepository.findAll();
    return items.map(ItemResponseDto.fromEntity);
  }
}
