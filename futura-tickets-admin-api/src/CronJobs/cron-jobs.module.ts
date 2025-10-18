import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// MODULES
import { EventModule } from '../Event/event.module';
import { SalesModule } from '../Sales/sales.module';

// SERVICES
import { CronJobsService } from './cron-jobs.service';

@Module({
  imports: [ScheduleModule.forRoot(), EventModule, SalesModule],
  providers: [CronJobsService],
})
export class CronJobsModule {}
