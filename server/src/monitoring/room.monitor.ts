// server/src/monitoring/room.monitor.ts
import { metricsRegistry } from '../metrics/registry';

export class RoomMonitor {
  private activeRooms = metricsRegistry.gauge('room_active_total', 'Active rooms count');
  private roomCreations = metricsRegistry.counter('room_creations_total', 'Total created rooms');
  private roomDeletions = metricsRegistry.counter('room_deletions_total', 'Total deleted rooms');
  private ownerTransfers = metricsRegistry.counter('room_owner_transfers_total', 'Total owner transfers');
  private peakActiveRooms = metricsRegistry.gauge('room_active_peak', 'Peak active rooms count');

  private roomStartTimes = new Map<string, number>();
  private roomLifetimes = metricsRegistry.histogram('room_lifetime_seconds', 'Lifetime of deleted rooms in seconds');
  private roomParticipants = new Map<string, number>();

  recordRoomCreated(roomId: string) {
    this.activeRooms.inc();
    this.roomCreations.inc();
    this.roomStartTimes.set(roomId, Date.now());
    this.roomParticipants.set(roomId, 1);

    const active = this.activeRooms.get();
    if (active > this.peakActiveRooms.get()) {
      this.peakActiveRooms.set(active);
    }
  }

  recordRoomDeleted(roomId: string) {
    this.activeRooms.dec();
    this.roomDeletions.inc();

    const start = this.roomStartTimes.get(roomId);
    if (start) {
      const lifetime = (Date.now() - start) / 1000;
      this.roomLifetimes.observe(lifetime);
      this.roomStartTimes.delete(roomId);
    }
    this.roomParticipants.delete(roomId);
  }

  recordOwnerTransfer() {
    this.ownerTransfers.inc();
  }

  updateParticipants(roomId: string, count: number) {
    this.roomParticipants.set(roomId, count);
  }

  getAverageParticipants(): number {
    const counts = Array.from(this.roomParticipants.values());
    if (counts.length === 0) return 0;
    return counts.reduce((a, b) => a + b, 0) / counts.length;
  }

  getStats() {
    return {
      activeRooms: this.activeRooms.get(),
      roomCreations: this.roomCreations.get(),
      roomDeletions: this.roomDeletions.get(),
      ownerTransfers: this.ownerTransfers.get(),
      peakActiveRooms: this.peakActiveRooms.get(),
      averageParticipants: this.getAverageParticipants(),
      roomLifetimes: this.roomLifetimes.getStats(),
    };
  }
}

export const roomMonitor = new RoomMonitor();
