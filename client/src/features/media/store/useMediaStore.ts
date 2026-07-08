import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface DeviceInfo {
  deviceId: string;
  label: string;
}

export interface RemoteParticipantMedia {
  socketId: string;
  userId?: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  screenSharing: boolean;
  isSpeaking: boolean;
  quality: 'high' | 'medium' | 'low' | 'poor';
}

interface MediaState {
  // Local Media State
  cameraEnabled: boolean;
  micEnabled: boolean;
  screenSharing: boolean;
  
  // Local Devices
  cameras: DeviceInfo[];
  microphones: DeviceInfo[];
  speakers: DeviceInfo[];
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;

  // Local Permissions
  permissions: {
    camera: boolean | null;
    microphone: boolean | null;
    screen: boolean | null;
  };

  // Remote Media State
  remoteMedia: Record<string, RemoteParticipantMedia>; // Key is socketId

  // Actions
  setCameraEnabled: (enabled: boolean) => void;
  setMicEnabled: (enabled: boolean) => void;
  setScreenSharing: (sharing: boolean) => void;
  setDevices: (type: 'cameras' | 'microphones' | 'speakers', devices: DeviceInfo[]) => void;
  setSelectedDevice: (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => void;
  setPermissions: (permissions: Partial<MediaState['permissions']>) => void;
  updateRemoteParticipant: (socketId: string, update: Partial<RemoteParticipantMedia>) => void;
  removeRemoteParticipant: (socketId: string) => void;
  clearState: () => void;
}

const initialState = {
  cameraEnabled: false,
  micEnabled: false,
  screenSharing: false,
  cameras: [],
  microphones: [],
  speakers: [],
  selectedCamera: null,
  selectedMicrophone: null,
  selectedSpeaker: null,
  permissions: {
    camera: null,
    microphone: null,
    screen: null,
  },
  remoteMedia: {},
};

export const useMediaStore = create<MediaState>()(
  devtools((set) => ({
    ...initialState,
    setCameraEnabled: (cameraEnabled) => set({ cameraEnabled }),
    setMicEnabled: (micEnabled) => set({ micEnabled }),
    setScreenSharing: (screenSharing) => set({ screenSharing }),
    setDevices: (type, devices) => set({ [type]: devices }),
    setSelectedDevice: (type, deviceId) => {
      if (type === 'camera') set({ selectedCamera: deviceId });
      else if (type === 'microphone') set({ selectedMicrophone: deviceId });
      else if (type === 'speaker') set({ selectedSpeaker: deviceId });
    },
    setPermissions: (permissions) => set((state) => ({ permissions: { ...state.permissions, ...permissions } })),
    updateRemoteParticipant: (socketId, update) => set((state) => ({
      remoteMedia: {
        ...state.remoteMedia,
        [socketId]: {
          ...(state.remoteMedia[socketId] || {
            socketId,
            cameraEnabled: false,
            micEnabled: false,
            screenSharing: false,
            isSpeaking: false,
            quality: 'high'
          }),
          ...update
        }
      }
    })),
    removeRemoteParticipant: (socketId) => set((state) => {
      const newRemoteMedia = { ...state.remoteMedia };
      delete newRemoteMedia[socketId];
      return { remoteMedia: newRemoteMedia };
    }),
    clearState: () => set(initialState),
  }))
);
