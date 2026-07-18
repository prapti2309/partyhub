// server/src/monitoring/api.monitor.ts
import { metricsRegistry } from '../metrics/registry';

export class ApiMonitor {
  private requestsTotal = metricsRegistry.counter('http_requests_total', 'Total HTTP requests count');
  private errorsTotal = metricsRegistry.counter('http_errors_total', 'Total HTTP server errors');
  private responseTime = metricsRegistry.histogram('http_response_time_ms', 'HTTP response time in ms');
  private validationFailures = metricsRegistry.counter('http_validation_failures_total', 'Total request validation failures');

  recordRequest(method: string, path: string, statusCode: number, durationMs: number) {
    this.requestsTotal.inc();
    this.responseTime.observe(durationMs);
    
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 400 || statusCode === 422) {
        this.validationFailures.inc();
      }
    } else if (statusCode >= 500) {
      this.errorsTotal.inc();
    }
  }

  getStats() {
    return {
      requestsTotal: this.requestsTotal.get(),
      errorsTotal: this.errorsTotal.get(),
      validationFailures: this.validationFailures.get(),
      responseTime: this.responseTime.getStats(),
    };
  }
}

export const apiMonitor = new ApiMonitor();
