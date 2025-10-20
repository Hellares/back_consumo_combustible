// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint raíz (backward compatibility)
  @Get()
  @ApiOperation({ summary: 'Health check raíz' })
  getHealth() {
    return this.appService.getHealth();
  }

  //Endpoint dedicado para health check
  @Get('health')
  @ApiOperation({ summary: 'Health check del sistema' })
  healthCheck() {
    return this.appService.getHealth();
  }
}