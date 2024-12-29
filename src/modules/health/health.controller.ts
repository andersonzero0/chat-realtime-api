import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { AuthProjectsGuard } from '../auth/auth.projects.guard';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @ApiOperation({ summary: 'Check health' })
  @UseGuards(AuthProjectsGuard)
  @Get()
  check() {
    return this.healthService.check();
  }
}
