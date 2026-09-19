"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsRegistry = exports.MetricsRegistry = void 0;
// server/src/metrics/registry.ts
const collectors_1 = require("./collectors");
class MetricsRegistry {
    static instance;
    counters = new Map();
    gauges = new Map();
    histograms = new Map();
    constructor() { }
    static getInstance() {
        if (!MetricsRegistry.instance) {
            MetricsRegistry.instance = new MetricsRegistry();
        }
        return MetricsRegistry.instance;
    }
    counter(name, help) {
        let c = this.counters.get(name);
        if (!c) {
            c = new collectors_1.Counter(name, help);
            this.counters.set(name, c);
        }
        return c;
    }
    gauge(name, help) {
        let g = this.gauges.get(name);
        if (!g) {
            g = new collectors_1.Gauge(name, help);
            this.gauges.set(name, g);
        }
        return g;
    }
    histogram(name, help) {
        let h = this.histograms.get(name);
        if (!h) {
            h = new collectors_1.Histogram(name, help);
            this.histograms.set(name, h);
        }
        return h;
    }
    getMetrics() {
        const metrics = {};
        for (const [name, c] of this.counters.entries()) {
            metrics[name] = c.get();
        }
        for (const [name, g] of this.gauges.entries()) {
            metrics[name] = g.get();
        }
        for (const [name, h] of this.histograms.entries()) {
            metrics[name] = h.getStats();
        }
        return metrics;
    }
    toPrometheusFormat() {
        let output = '';
        for (const [name, c] of this.counters.entries()) {
            output += `# HELP ${name} ${c.help}\n`;
            output += `# TYPE ${name} counter\n`;
            output += `${name} ${c.get()}\n\n`;
        }
        for (const [name, g] of this.gauges.entries()) {
            output += `# HELP ${name} ${g.help}\n`;
            output += `# TYPE ${name} gauge\n`;
            output += `${name} ${g.get()}\n\n`;
        }
        for (const [name, h] of this.histograms.entries()) {
            const stats = h.getStats();
            output += `# HELP ${name} ${h.help}\n`;
            output += `# TYPE ${name} summary\n`;
            output += `${name}_count ${stats.count}\n`;
            output += `${name}_sum ${stats.sum}\n`;
            output += `${name}{quantile="0.5"} ${stats.p50}\n`;
            output += `${name}{quantile="0.95"} ${stats.p95}\n`;
            output += `${name}{quantile="0.99"} ${stats.p99}\n\n`;
        }
        return output;
    }
}
exports.MetricsRegistry = MetricsRegistry;
exports.metricsRegistry = MetricsRegistry.getInstance();
