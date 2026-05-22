import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from '@repositories/item/item.repository';
import type { UpdateItemRequestDto } from '@entrypoints/items/dto/update-item.request.dto';
import { ItemResponseDto } from '@entrypoints/items/dto/item.response.dto';

@Injectable()
export class UpdateItemHandler {
  constructor(private readonly itemRepository: ItemRepository) {}

  async handle(
    id: string,
    dto: UpdateItemRequestDto,
  ): Promise<ItemResponseDto> {
    const item = await this.itemRepository.update(id, dto);
    if (!item) throw new NotFoundException('Item not found');
    return ItemResponseDto.fromEntity(item);
  }
}
