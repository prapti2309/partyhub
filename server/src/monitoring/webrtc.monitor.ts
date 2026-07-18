// server/src/monitoring/webrtc.monitor.ts
import { metricsRegistry } from '../metrics/registry';

export class WebRtcMonitor {
  private offerFailures = metricsRegistry.counter('webrtc_offer_failures_total', 'Total WebRTC offer processing failures');
  private answerFailures = metricsRegistry.counter('webrtc_answer_failures_total', 'Total WebRTC answer processing failures');
  private iceFailures = metricsRegistry.counter('webrtc_ice_failures_total', 'Total WebRTC ICE candidate failures');
  private activeStreams = metricsRegistry.gauge('webrtc_streams_active', 'Active WebRTC streams count');
  
  private cameraFailures = metricsRegistry.counter('webrtc_camera_failures_total', 'Total camera acquisition/toggle failures');
  private micFailures = metricsRegistry.counter('webrtc_microphone_failures_total', 'Total microphone acquisition/toggle failures');
  private screenShareFailures = metricsRegistry.counter('webrtc_screenshare_failures_total', 'Total screenshare acquisition/toggle failures');

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

export const webrtcMonitor = new WebRtcMonitor();
