"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomMonitor = exports.RoomMonitor = void 0;
// server/src/monitoring/room.monitor.ts
const registry_1 = require("../metrics/registry");
class RoomMonitor {
    activeRooms = registry_1.metricsRegistry.gauge('room_active_total', 'Active rooms count');
    roomCreations = registry_1.metricsRegistry.counter('room_creations_total', 'Total created rooms');
    roomDeletions = registry_1.metricsRegistry.counter('room_deletions_total', 'Total deleted rooms');
    ownerTransfers = registry_1.metricsRegistry.counter('room_owner_transfers_total', 'Total owner transfers');
    peakActiveRooms = registry_1.metricsRegistry.gauge('room_active_peak', 'Peak active rooms count');
    roomStartTimes = new Map();
    roomLifetimes = registry_1.metricsRegistry.histogram('room_lifetime_seconds', 'Lifetime of deleted rooms in seconds');
    roomParticipants = new Map();
    recordRoomCreated(roomId) {
        this.activeRooms.inc();
        this.roomCreations.inc();
        this.roomStartTimes.set(roomId, Date.now());
        this.roomParticipants.set(roomId, 1);
        const active = this.activeRooms.get();
        if (active > this.peakActiveRooms.get()) {
            this.peakActiveRooms.set(active);
        }
    }
    recordRoomDeleted(roomId) {
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
    updateParticipants(roomId, count) {
        this.roomParticipants.set(roomId, count);
    }
    getAverageParticipants() {
        const counts = Array.from(this.roomParticipants.values());
        if (counts.length === 0)
            return 0;
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
exports.RoomMonitor = RoomMonitor;
exports.roomMonitor = new RoomMonitor();
