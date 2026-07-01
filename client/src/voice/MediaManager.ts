// src/voice/MediaManager.ts
/**
 * Manages access to the user's microphone.
 * Provides a single shared MediaStream for the app to reuse.
 */
export class MediaManager {
  private static instance: MediaManager;
  private stream: MediaStream | null = null;

  private constructor() {}

  public static getInstance(): MediaManager {
    if (!MediaManager.instance) {
      MediaManager.instance = new MediaManager();
    }
    return MediaManager.instance;
  }

  /** Request microphone access (audio only). */
  async acquire(): Promise<MediaStream> {
    if (this.stream) return this.stream;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return this.stream;
  }

  /** Release the stream and stop all tracks. */
  release(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }
}
