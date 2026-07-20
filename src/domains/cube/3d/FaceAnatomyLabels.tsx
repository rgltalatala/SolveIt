import { useEffect, useMemo } from 'react';
import { Line } from '@react-three/drei';
import { CanvasTexture, DoubleSide, LinearFilter } from 'three';
import type { Face } from '@/domains/cube/cubeState';

const LABEL_COLOR = '#ef4444';
const LABEL_COLOR_DIM = '#b91c1c';

type FaceLabelConfig = {
  face: Face;
  labelPosition: [number, number, number];
  linePoints?: [[number, number, number], [number, number, number]];
  rotation?: [number, number, number];
};

const FACE_CENTER = 1.55;
const CALLOUT_OFFSET = 2.35;
/** Outer sticker shell (cubie center ± half cubie size). */
const CUBE_SURFACE = 1 + 0.92 / 2;

const FACE_LABEL_CONFIG: FaceLabelConfig[] = [
  {
    face: 'U',
    labelPosition: [0, FACE_CENTER, 0],
    rotation: [-Math.PI / 2, 0, 0],
  },
  {
    face: 'F',
    labelPosition: [0, 0, FACE_CENTER],
  },
  {
    face: 'R',
    labelPosition: [FACE_CENTER, 0, 0],
    rotation: [0, Math.PI / 2, 0],
  },
  {
    face: 'L',
    labelPosition: [-2.05, 0.2, 2.05],
    linePoints: [
      [-1.8, 0.2, 1.95],
      [-CUBE_SURFACE, 0.15, CUBE_SURFACE * 0.9],
    ],
  },
  {
    face: 'D',
    labelPosition: [0.15, -2.05, 2.05],
    linePoints: [
      [0.15, -1.8, 1.95],
      [0.15, -CUBE_SURFACE, CUBE_SURFACE * 0.9],
    ],
  },
  {
    face: 'B',
    labelPosition: [CALLOUT_OFFSET * 0.55, 0.2, -CALLOUT_OFFSET],
    linePoints: [
      [CALLOUT_OFFSET * 0.45, 0.15, -CALLOUT_OFFSET + 0.35],
      [0.3, 0.15, -CUBE_SURFACE],
    ],
  },
];

type FaceAnatomyLabelsProps = {
  highlightedFace: Face | null;
};

function createFaceLetterTexture(face: Face, color: string): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, size, size);
  ctx.font = 'bold 84px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 12;
  ctx.strokeText(face, size / 2, size / 2 + 2);
  ctx.fillStyle = color;
  ctx.fillText(face, size / 2, size / 2 + 2);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function FaceLetterLabel({
  face,
  position,
  rotation,
  color,
  fontSize,
  opacity,
}: {
  face: Face;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  fontSize: number;
  opacity: number;
}) {
  const texture = useMemo(
    () => createFaceLetterTexture(face, color),
    [face, color],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={position} rotation={rotation} renderOrder={11}>
      <planeGeometry args={[fontSize, fontSize]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthTest={false}
        side={DoubleSide}
      />
    </mesh>
  );
}

export function FaceAnatomyLabels({ highlightedFace }: FaceAnatomyLabelsProps) {
  return (
    <group>
      {FACE_LABEL_CONFIG.map(
        ({ face, labelPosition, linePoints, rotation }) => {
          const isHighlighted =
            highlightedFace === null || highlightedFace === face;
          const color = isHighlighted ? LABEL_COLOR : LABEL_COLOR_DIM;
          const fontSize = highlightedFace === face ? 1.05 : 0.85;
          const lineWidth = highlightedFace === face ? 3 : 1.5;
          const opacity = isHighlighted ? 1 : 0.55;

          return (
            <group key={face}>
              {linePoints ? (
                <Line
                  points={linePoints}
                  color={color}
                  lineWidth={lineWidth}
                  transparent
                  opacity={opacity}
                />
              ) : null}
              <FaceLetterLabel
                face={face}
                position={labelPosition}
                rotation={rotation ?? [0, 0, 0]}
                color={color}
                fontSize={fontSize}
                opacity={opacity}
              />
            </group>
          );
        },
      )}
    </group>
  );
}
