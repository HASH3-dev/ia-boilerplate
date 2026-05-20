import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from '@repositories/base.abstract.repository';
import type { Item } from './item.entity';

@Injectable()
export class ItemRepository extends BaseAbstractRepository {
  constructor() {
    super(ItemRepository);
  }

  async findAll(): Promise<Item[]> {
    const records = await this.knex.select('*').from('items').orderBy('created_at', 'desc');
    return records.map((r) => this.itemFactory(r));
  }

  async findById(id: string): Promise<Item | null> {
    const record = await this.knex.select('*').from('items').where('id', id).first();
    return this.itemFactory(record);
  }

  async create(data: { title: string; description?: string }): Promise<Item> {
    const [record] = await this.knex('items')
      .insert({ title: data.title, description: data.description ?? null })
      .returning('*');
    return this.itemFactory(record);
  }

  async update(id: string, data: { title?: string; description?: string }): Promise<Item | null> {
    const [record] = await this.knex('items')
      .where('id', id)
      .update({ ...data, updated_at: this.knex.fn.now() })
      .returning('*');
    return this.itemFactory(record ?? null);
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.knex('items').where('id', id).delete();
    return count > 0;
  }

  private itemFactory(record: Record<string, unknown> | null | undefined): Item {
    if (!record) return null as unknown as Item;
    return {
      id: record.id as string,
      title: record.title as string,
      description: record.description as string | null,
      createdAt: record.created_at as Date,
      updatedAt: record.updated_at as Date,
    };
  }
}
