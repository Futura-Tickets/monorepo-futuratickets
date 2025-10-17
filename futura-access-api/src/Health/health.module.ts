import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthCheckController } from './health-check.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthCheckController],
  providers: [],
})
export class HealthModule {}
