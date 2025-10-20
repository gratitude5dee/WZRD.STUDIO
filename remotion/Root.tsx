import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition, type VideoCompositionProps } from '../src/components/editor/VideoComposition';

const DEFAULT_PROPS: VideoCompositionProps = {
  clips: [],
  audioTracks: [],
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="VideoEditorComposition"
    component={VideoComposition}
    durationInFrames={300}
    fps={30}
    width={1280}
    height={720}
    defaultProps={DEFAULT_PROPS}
  />
);

export default RemotionRoot;
