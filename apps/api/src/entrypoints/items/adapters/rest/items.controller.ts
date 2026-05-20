import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Anonymous } from '@shared/decorators/anonymous.decorator';
import { CreateItemRequestDto } from '@entrypoints/items/dto/create-item.request.dto';
import { UpdateItemRequestDto } from '@entrypoints/items/dto/update-item.request.dto';
import { ItemResponseDto } from '@entrypoints/items/dto/item.response.dto';
import { ListItemsHandler } from '@entrypoints/items/use-cases/list-items/list-items.handler';
import { GetItemHandler } from '@entrypoints/items/use-cases/get-item/get-item.handler';
import { CreateItemHandler } from '@entrypoints/items/use-cases/create-item/create-item.handler';
import { UpdateItemHandler } from '@entrypoints/items/use-cases/update-item/update-item.handler';
import { DeleteItemHandler } from '@entrypoints/items/use-cases/delete-item/delete-item.handler';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(
    private readonly listItemsHandler: ListItemsHandler,
    private readonly getItemHandler: GetItemHandler,
    private readonly createItemHandler: CreateItemHandler,
    private readonly updateItemHandler: UpdateItemHandler,
    private readonly deleteItemHandler: DeleteItemHandler,
  ) {}

  @Anonymous()
  @Get()
  @ApiOperation({ operationId: 'listItems', summary: 'List all items' })
  async list(): Promise<ItemResponseDto[]> {
    return this.listItemsHandler.handle();
  }

  @Anonymous()
  @Get(':id')
  @ApiOperation({ operationId: 'getItem', summary: 'Get item by ID' })
  async get(@Param('id') id: string): Promise<ItemResponseDto> {
    return this.getItemHandler.handle(id);
  }

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ operationId: 'createItem', summary: 'Create a new item' })
  async create(@Body() dto: CreateItemRequestDto): Promise<ItemResponseDto> {
    return this.createItemHandler.handle(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ operationId: 'updateItem', summary: 'Update an item' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateItemRequestDto,
  ): Promise<ItemResponseDto> {
    return this.updateItemHandler.handle(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: 'deleteItem', summary: 'Delete an item' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteItemHandler.handle(id);
  }
}
