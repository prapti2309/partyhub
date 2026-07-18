// server/src/metrics/collectors.ts

export class Counter {
  private value = 0;
  private labels: Record<string, string> = {};

  constructor(public name: string, public help: string) {}

  inc(val = 1) {
    this.value += val;
  }

  get() {
    return this.value;
  }

  reset() {
    this.value = 0;
  }
}

export class Gauge {
  private value = 0;

  constructor(public name: string, public help: string) {}

  set(val: number) {
    this.value = val;
  }

  inc(val = 1) {
    this.value += val;
  }

  dec(val = 1) {
    this.value -= val;
  }

  get() {
    return this.value;
  }
}

export class Histogram {
  private samples: number[] = [];
  private maxSamples = 1000;

  constructor(public name: string, public help: string) {}

  observe(val: number) {
    this.samples.push(val);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  getStats() {
    if (this.samples.length === 0) {
      return { count: 0, sum: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
    }
    const sorted = [...this.samples].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const min = sorted[0];
    const max = sorted[count - 1];
    const avg = sum / count;
    
    const percentile = (p: number) => {
      const idx = Math.ceil((p / 100) * count) - 1;
      return sorted[Math.max(0, Math.min(count - 1, idx))];
    };

    return {
      count,
      sum,
      min,
      max,
      avg,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    };
  }

  reset() {
    this.samples = [];
  }
}
