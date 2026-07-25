import React from 'react';
import {Composition} from 'remotion';
import {PawSwipe} from './PawSwipe';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PawSwipe"
      component={PawSwipe}
      durationInFrames={20}
      fps={30}
      width={220}
      height={260}
    />
  );
};
