import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  handleMetrics(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.send(this.metricsService.serialize());
  }
}
