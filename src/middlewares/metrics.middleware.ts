import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { NextFunction, Request, Response } from 'express';
import { Counter, Gauge } from 'prom-client';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  public customDurationGauge: Gauge<string>;
  public customErrorsCounter: Counter<string>;

  constructor(
    @InjectMetric('count') public appCounter: Counter<string>,
    @InjectMetric('gauge') public appGauge: Gauge<string>,
  ) {
    this.customDurationGauge = new Gauge<string>({
      name: 'app_duration_metrics',
      help: 'app_concurrent_metrics_help',
      labelNames: ['app_method', 'app_origin', 'le'],
    });
    this.customErrorsCounter = new Counter<string>({
      name: 'app_error_metrics',
      help: 'app_usage_metrics_to_detect_errors',
      labelNames: ['app_method', 'app_origin', 'app_status'],
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.appCounter.labels(req.method, req.originalUrl).inc();
    this.appGauge.inc();

    const startTime = Date.now();

    res.on('finish', () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.customDurationGauge
        .labels(req.method, req.originalUrl, (duration / 1000).toString())
        .set(duration);

      this.customErrorsCounter
        .labels(req.method, req.originalUrl, res.statusCode.toString())
        .inc();
    });

    next();
  }
}
