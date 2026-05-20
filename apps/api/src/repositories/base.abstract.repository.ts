import { Injectable } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import type { Knex } from 'knex';

@Injectable()
export abstract class BaseAbstractRepository {
  @InjectKnex() protected readonly knex: Knex;

  constructor(private concreteClass: Type<BaseAbstractRepository>) {}

  transactioning(trx: Knex.Transaction): this {
    return Object.assign(new this.concreteClass(), this, {
      knex: trx ?? this.knex,
    });
  }
}
