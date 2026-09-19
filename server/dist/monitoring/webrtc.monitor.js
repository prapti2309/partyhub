"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webrtcMonitor = exports.WebRtcMonitor = void 0;
// server/src/monitoring/webrtc.monitor.ts
const registry_1 = require("../metrics/registry");
class WebRtcMonitor {
    offerFailures = registry_1.metricsRegistry.counter('webrtc_offer_failures_total', 'Total WebRTC offer processing failures');
    answerFailures = registry_1.metricsRegistry.counter('webrtc_answer_failures_total', 'Total WebRTC answer processing failures');
    iceFailures = registry_1.metricsRegistry.counter('webrtc_ice_failures_total', 'Total WebRTC ICE candidate failures');
    activeStreams = registry_1.metricsRegistry.gauge('webrtc_streams_active', 'Active WebRTC streams count');
    cameraFailures = registry_1.metricsRegistry.counter('webrtc_camera_failures_total', 'Total camera acquisition/toggle failures');
    micFailures = registry_1.metricsRegistry.counter('webrtc_microphone_failures_total', 'Total microphone acquisition/toggle failures');
    screenShareFailures = registry_1.metricsRegistry.counter('webrtc_screenshare_failures_total', 'Total screenshare acquisition/toggle failures');
    recordOfferFailure() {
        this.offerFailures.inc();
    }
    recordAnswerFailure() {
        this.answerFailures.inc();
    }
    recordIceFailure() {
        this.iceFailures.inc();
    }
    recordStreamStart() {
        this.activeStreams.inc();
    }
    recordStreamStop() {
        this.activeStreams.dec();
    }
    recordCameraFailure() {
        this.cameraFailures.inc();
    }
    recordMicFailure() {
        this.micFailures.inc();
    }
    recordScreenShareFailure() {
        this.screenShareFailures.inc();
    }
    getStats() {
        return {
            offerFailures: this.offerFailures.get(),
            answerFailures: this.answerFailures.get(),
            iceFailures: this.iceFailures.get(),
            activeStreams: this.activeStreams.get(),
            cameraFailures: this.cameraFailures.get(),
            micFailures: this.micFailures.get(),
            screenShareFailures: this.screenShareFailures.get(),
        };
    }
}
exports.WebRtcMonitor = WebRtcMonitor;
exports.webrtcMonitor = new WebRtcMonitor();
