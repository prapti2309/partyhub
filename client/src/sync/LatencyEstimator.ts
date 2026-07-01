// client/src/sync/LatencyEstimator.ts
import { SOCKET_EVENTS } from "@/sockets/events";
import { socketManager } from "@/lib/socket/SocketManager";

export class LatencyEstimator {
  private rtt: number = 0; // milliseconds
  private alpha: number = 0.2; // EWMA smoothing factor
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMs: number = 500) {
    if (this.intervalId) return;
    this.intervalId = setInterval(this.ping.bind(this), intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async ping() {
    const start = Date.now();
    try {
      await socketManager.emitWithAck(SOCKET_EVENTS.PING, {});
      const rtt = Date.now() - start;
      this.updateRtt(rtt);
    } catch (e) {
      // ignore failed pings
    }
  }

  private updateRtt(sample: number) {
    // Exponential weighted moving average, ignore outliers > 3x current rtt
    if (this.rtt && sample > this.rtt * 3) return;
    this.rtt = this.rtt ? this.rtt * (1 - this.alpha) + sample * this.alpha : sample;
  }

  /**
   * Returns the estimated one‑way latency (half of RTT).
   */
  get latency(): number {
    return this.rtt / 2;
  }
}
