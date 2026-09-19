"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiMonitor = exports.ApiMonitor = void 0;
// server/src/monitoring/api.monitor.ts
const registry_1 = require("../metrics/registry");
class ApiMonitor {
    requestsTotal = registry_1.metricsRegistry.counter('http_requests_total', 'Total HTTP requests count');
    errorsTotal = registry_1.metricsRegistry.counter('http_errors_total', 'Total HTTP server errors');
    responseTime = registry_1.metricsRegistry.histogram('http_response_time_ms', 'HTTP response time in ms');
    validationFailures = registry_1.metricsRegistry.counter('http_validation_failures_total', 'Total request validation failures');
    recordRequest(_method, _path, statusCode, durationMs) {
        this.requestsTotal.inc();
        this.responseTime.observe(durationMs);
        if (statusCode >= 400 && statusCode < 500) {
            if (statusCode === 400 || statusCode === 422) {
                this.validationFailures.inc();
            }
        }
        else if (statusCode >= 500) {
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
exports.ApiMonitor = ApiMonitor;
exports.apiMonitor = new ApiMonitor();
