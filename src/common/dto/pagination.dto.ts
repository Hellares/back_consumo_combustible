import { IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  //@IsPositive()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  //@IsPositive()
  @Min(0)
  @Max(100)
  offset?: number;
}