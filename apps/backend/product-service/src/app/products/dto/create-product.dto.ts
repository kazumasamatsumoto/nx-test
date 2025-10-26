import { IsNotEmpty, IsString, IsNumber, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsString()
  @IsNotEmpty()
  category: string;
}
