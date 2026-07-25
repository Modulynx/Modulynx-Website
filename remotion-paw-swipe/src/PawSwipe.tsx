import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

/**
 * Claw-mark scratch trails ONLY — no paw drawn here (the real paw is the
 * hero's own SVG paw; see .lynx-stage:hover #pawR in style.css). Curved,
 * diagonal paths matching the paw's actual sweep: raised up-and-back, then
 * swiping down-and-forward through a rotational arc, not a straight drop.
 */
const AMBER = '#f2a83b';
const ICE = '#8fc7dd';

// three marks, spaced even further apart — one per claw, not bunched together
const MARKS = [
  {d: 'M -55 -25 Q 15 25, 35 110', len: 185, width: 3.4},
  {d: 'M 15 -35 Q 65 15, 95 118', len: 199, width: 4},
  {d: 'M 85 -45 Q 115 5, 155 125', len: 214, width: 3.4},
];

export const PawSwipe: React.FC = () => {
  const frame = useCurrentFrame();

  const drawEnd = 8;
  const holdEnd = 14;
  const fadeEnd = 20;

  const drawProgress = interpolate(frame, [0, drawEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const markOpacity = interpolate(
    frame,
    [0, 2, holdEnd, fadeEnd],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill>
      <svg viewBox="-70 -60 280 200" style={{width: '100%', height: '100%', overflow: 'visible'}}>
        <defs>
          <linearGradient id="edgeGrad" x1="-55" y1="-45" x2="155" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={AMBER} />
            <stop offset=".5" stopColor={ICE} />
            <stop offset="1" stopColor={AMBER} />
          </linearGradient>
        </defs>

        <g opacity={markOpacity}>
          {MARKS.map((m, i) => (
            <path
              key={i}
              d={m.d}
              fill="none"
              stroke="url(#edgeGrad)"
              strokeWidth={m.width}
              strokeLinecap="round"
              strokeDasharray={m.len}
              strokeDashoffset={m.len * (1 - drawProgress)}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
