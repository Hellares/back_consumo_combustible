import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RechazarTicketDto {
  @ApiProperty({
    description: 'Motivo del rechazo del ticket',
    example: 'Kilometraje inconsistente con último registro',
    maxLength: 500
  })
  @IsNotEmpty({ message: 'El motivo del rechazo es obligatorio' })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  motivoRechazo: string;
}