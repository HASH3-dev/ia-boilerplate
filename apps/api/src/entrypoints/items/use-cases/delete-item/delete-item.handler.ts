import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from '@repositories/item/item.repository';

@Injectable()
export class DeleteItemHandler {
  constructor(private readonly itemRepository: ItemRepository) {}

  async handle(id: string): Promise<void> {
    const deleted = await this.itemRepository.delete(id);
    if (!deleted) throw new NotFoundException('Item not found');
  }
}
