import { Injectable } from '@nestjs/common';
import { CreateTicketsAbastecimientoDto } from './dto/create-tickets_abastecimiento.dto';
import { UpdateTicketsAbastecimientoDto } from './dto/update-tickets_abastecimiento.dto';

@Injectable()
export class TicketsAbastecimientoService {
  create(createTicketsAbastecimientoDto: CreateTicketsAbastecimientoDto) {
    return 'This action adds a new ticketsAbastecimiento';
  }

  findAll() {
    return `This action returns all ticketsAbastecimiento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticketsAbastecimiento`;
  }

  update(id: number, updateTicketsAbastecimientoDto: UpdateTicketsAbastecimientoDto) {
    return `This action updates a #${id} ticketsAbastecimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticketsAbastecimiento`;
  }
}
