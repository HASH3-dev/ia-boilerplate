import type { Item } from '@repositories/item/item.entity';

export class ItemResponseDto {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;

  static fromEntity(item: Item): ItemResponseDto {
    const dto = new ItemResponseDto();
    dto.id = item.id;
    dto.title = item.title;
    dto.description = item.description;
    dto.createdAt = item.createdAt.toISOString();
    dto.updatedAt = item.updatedAt.toISOString();
    return dto;
  }
}
