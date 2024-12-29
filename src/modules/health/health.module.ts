import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../services/prisma/prisma.module';
import { HealthService } from './health.service';

@Module({
  imports: [TerminusModule, PrismaModule, HttpModule, AuthModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
