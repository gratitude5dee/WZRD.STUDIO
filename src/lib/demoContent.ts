import { Clip, AudioTrack } from '@/store/videoEditorStore';

export const DEMO_CLIPS: Clip[] = [
  {
    id: 'demo-clip-1',
    type: 'video',
    name: 'One by iterating over',
    url: '/bgvid.mp4',
    startTime: 0,
    duration: 5000,
    endTime: 5000,
    trackIndex: 0,
    layer: 1,
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'demo-clip-2',
    type: 'video',
    name: 'day pro...',
    url: '/bgvid.mp4',
    startTime: 5000,
    duration: 3000,
    endTime: 8000,
    trackIndex: 0,
    layer: 1,
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'demo-clip-3',
    type: 'video',
    name: 'Welcom...',
    url: '/bgvid.mp4',
    startTime: 8000,
    duration: 4000,
    endTime: 12000,
    trackIndex: 0,
    layer: 1,
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'demo-clip-4',
    type: 'video',
    name: '29.',
    url: '/bgvid.mp4',
    startTime: 12000,
    duration: 2000,
    endTime: 14000,
    trackIndex: 0,
    layer: 1,
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'demo-clip-5',
    type: 'video',
    name: 'Mapet typ...',
    url: '/bgvid.mp4',
    startTime: 14000,
    duration: 3000,
    endTime: 17000,
    trackIndex: 0,
    layer: 1,
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'demo-clip-6',
    type: 'video',
    name: 'you to...',
    url: '/bgvid.mp4',
    startTime: 17000,
    duration: 3000,
    endTime: 20000,
    trackIndex: 0,
    layer: 1,
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
    },
  },
  {
    id: 'demo-clip-7',
    type: 'video',
    name: 'existing type into',
    url: '/bgvid.mp4',
    startTime: 20000,
    duration: 4000,
    endTime: 24000,
    trackIndex: 0,
    layer: 1,
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
    },
  },
];

export const DEMO_AUDIO_TRACKS: AudioTrack[] = [];

export function loadDemoContent(
  addClip: (clip: Clip) => void,
  addAudioTrack: (track: AudioTrack) => void
) {
  DEMO_CLIPS.forEach((clip) => addClip(clip));
  DEMO_AUDIO_TRACKS.forEach((track) => addAudioTrack(track));
}
