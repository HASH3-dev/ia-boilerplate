import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from '@repositories/item/item.repository';
import { ItemResponseDto } from '@entrypoints/items/dto/item.response.dto';

@Injectable()
export class GetItemHandler {
  constructor(private readonly itemRepository: ItemRepository) {}

  async handle(id: string): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findById(id);
    if (!item) throw new NotFoundException('Item not found');
    return ItemResponseDto.fromEntity(item);
  }
}
