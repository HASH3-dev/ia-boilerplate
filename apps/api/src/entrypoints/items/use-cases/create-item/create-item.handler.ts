import { Injectable } from '@nestjs/common';
import { ItemRepository } from '@repositories/item/item.repository';
import type { CreateItemRequestDto } from '@entrypoints/items/dto/create-item.request.dto';
import { ItemResponseDto } from '@entrypoints/items/dto/item.response.dto';

@Injectable()
export class CreateItemHandler {
  constructor(private readonly itemRepository: ItemRepository) {}

  async handle(dto: CreateItemRequestDto): Promise<ItemResponseDto> {
    const item = await this.itemRepository.create(dto);
    return ItemResponseDto.fromEntity(item);
  }
}
