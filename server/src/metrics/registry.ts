// server/src/metrics/registry.ts
import { Counter, Gauge, Histogram } from './collectors';

export class MetricsRegistry {
  private static instance: MetricsRegistry;
  private counters = new Map<string, Counter>();
  private gauges = new Map<string, Gauge>();
  private histograms = new Map<string, Histogram>();

  private constructor() {}

  static getInstance(): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry();
    }
    return MetricsRegistry.instance;
  }

  counter(name: string, help: string): Counter {
    let c = this.counters.get(name);
    if (!c) {
      c = new Counter(name, help);
      this.counters.set(name, c);
    }
    return c;
  }

  gauge(name: string, help: string): Gauge {
    let g = this.gauges.get(name);
    if (!g) {
      g = new Gauge(name, help);
      this.gauges.set(name, g);
    }
    return g;
  }

  histogram(name: string, help: string): Histogram {
    let h = this.histograms.get(name);
    if (!h) {
      h = new Histogram(name, help);
      this.histograms.set(name, h);
    }
    return h;
  }

  getMetrics() {
    const metrics: any = {};
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

  toPrometheusFormat(): string {
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

export const metricsRegistry = MetricsRegistry.getInstance();
