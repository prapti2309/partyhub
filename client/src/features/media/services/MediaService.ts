import { useMediaStore } from '../store/useMediaStore';

class MediaService {
  private static instance: MediaService;
  private localStream: MediaStream | null = null;
  private displayStream: MediaStream | null = null;

  private constructor() {
    this.setupDeviceListeners();
  }

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getDisplayStream(): MediaStream | null {
    return this.displayStream;
  }

  private setupDeviceListeners() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        this.enumerateDevices();
      });
    }
  }

  public async enumerateDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn("enumerateDevices() not supported.");
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.substring(0, 5)}` }));
      const microphones = devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.substring(0, 5)}` }));
      const speakers = devices.filter(d => d.kind === 'audiooutput').map(d => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.substring(0, 5)}` }));

      useMediaStore.getState().setDevices('cameras', cameras);
      useMediaStore.getState().setDevices('microphones', microphones);
      useMediaStore.getState().setDevices('speakers', speakers);

      const state = useMediaStore.getState();
      if (!state.selectedCamera && cameras.length > 0) state.setSelectedDevice('camera', cameras[0].deviceId);
      if (!state.selectedMicrophone && microphones.length > 0) state.setSelectedDevice('microphone', microphones[0].deviceId);
      if (!state.selectedSpeaker && speakers.length > 0) state.setSelectedDevice('speaker', speakers[0].deviceId);

    } catch (err) {
      console.error("Error enumerating devices", err);
    }
  }

  public async enableCamera(deviceId?: string): Promise<MediaStreamTrack | null> {
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = stream.getVideoTracks()[0];
      
      if (!this.localStream) {
        this.localStream = new MediaStream();
      }
      
      const existingVideoTrack = this.localStream.getVideoTracks()[0];
      if (existingVideoTrack) {
        this.localStream.removeTrack(existingVideoTrack);
        existingVideoTrack.stop();
      }
      
      this.localStream.addTrack(videoTrack);
      useMediaStore.getState().setCameraEnabled(true);
      useMediaStore.getState().setPermissions({ camera: true });
      return videoTrack;
    } catch (error) {
      console.error("Error enabling camera:", error);
      useMediaStore.getState().setPermissions({ camera: false });
      return null;
    }
  }

  public disableCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = false;
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
      }
    }
    useMediaStore.getState().setCameraEnabled(false);
  }

  public async enableMicrophone(deviceId?: string): Promise<MediaStreamTrack | null> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const audioTrack = stream.getAudioTracks()[0];
      
      if (!this.localStream) {
        this.localStream = new MediaStream();
      }
      
      const existingAudioTrack = this.localStream.getAudioTracks()[0];
      if (existingAudioTrack) {
        this.localStream.removeTrack(existingAudioTrack);
        existingAudioTrack.stop();
      }
      
      this.localStream.addTrack(audioTrack);
      useMediaStore.getState().setMicEnabled(true);
      useMediaStore.getState().setPermissions({ microphone: true });
      return audioTrack;
    } catch (error) {
      console.error("Error enabling microphone:", error);
      useMediaStore.getState().setPermissions({ microphone: false });
      return null;
    }
  }

  public disableMicrophone() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
      }
    }
    useMediaStore.getState().setMicEnabled(false);
  }

  public async startScreenShare(): Promise<MediaStreamTrack | null> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      this.displayStream = stream;
      const screenTrack = stream.getVideoTracks()[0];
      
      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      useMediaStore.getState().setScreenSharing(true);
      useMediaStore.getState().setPermissions({ screen: true });
      return screenTrack;
    } catch (error) {
      console.error("Error starting screen share:", error);
      useMediaStore.getState().setPermissions({ screen: false });
      return null;
    }
  }

  public stopScreenShare() {
    if (this.displayStream) {
      this.displayStream.getTracks().forEach(track => track.stop());
      this.displayStream = null;
    }
    useMediaStore.getState().setScreenSharing(false);
  }

  public cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    this.stopScreenShare();
    useMediaStore.getState().clearState();
  }
}

export const mediaService = MediaService.getInstance();
