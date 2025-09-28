import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketsAbastecimientoService } from './tickets_abastecimiento.service';
import { CreateTicketsAbastecimientoDto } from './dto/create-tickets_abastecimiento.dto';
import { UpdateTicketsAbastecimientoDto } from './dto/update-tickets_abastecimiento.dto';

@Controller('tickets-abastecimiento')
export class TicketsAbastecimientoController {
  constructor(private readonly ticketsAbastecimientoService: TicketsAbastecimientoService) {}

  @Post()
  create(@Body() createTicketsAbastecimientoDto: CreateTicketsAbastecimientoDto) {
    return this.ticketsAbastecimientoService.create(createTicketsAbastecimientoDto);
  }

  @Get()
  findAll() {
    return this.ticketsAbastecimientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsAbastecimientoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketsAbastecimientoDto: UpdateTicketsAbastecimientoDto) {
    return this.ticketsAbastecimientoService.update(+id, updateTicketsAbastecimientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsAbastecimientoService.remove(+id);
  }
}
