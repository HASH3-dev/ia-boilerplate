import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Trim } from '@shared/decorators/trim.decorator';

export class UpdateItemRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Trim()
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Trim()
  description?: string;
}
