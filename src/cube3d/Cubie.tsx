import type { Face } from '../cube/cubeState';
import { colorHexMap } from '../cube/cubeColors';
import type { CubeAnatomyHighlight } from './cubeAnatomy';
import { resolveAnatomyStickerColor } from './cubeAnatomy';
import type { CubiePosition, DisplayColor } from './cubeGeometry';

export interface CubieProps {
  position: [number, number, number];
  cubiePosition: CubiePosition;
  faceColors: Partial<Record<Face, DisplayColor>>;
  anatomyHighlight?: CubeAnatomyHighlight | null;
}

const darkPlastic = '#111827';

const materialByNormal: Record<string, Face> = {
  px: 'R',
  nx: 'L',
  py: 'U',
  ny: 'D',
  pz: 'F',
  nz: 'B',
};

interface FaceMaterialProps {
  color: string;
  materialIndex: number;
}

function FaceMaterial({ color, materialIndex }: FaceMaterialProps) {
  const materialProps = {
    color,
    metalness: 0.05,
    roughness: 0.45,
  };
  // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z → R, L, U, D, F, B
  return (
    <meshStandardMaterial
      attach={`material-${materialIndex}`}
      {...materialProps}
    />
  );
}

export function Cubie({
  position,
  cubiePosition,
  faceColors,
  anatomyHighlight = null,
}: CubieProps) {
  const [x, y, z] = position;
  const size = 0.92;

  const materials = (
    Object.keys(materialByNormal) as (keyof typeof materialByNormal)[]
  ).map((normal) => {
    const face = materialByNormal[normal];
    const sticker = faceColors[face];
    if (!sticker) return darkPlastic;

    const anatomyColor = resolveAnatomyStickerColor(
      anatomyHighlight,
      cubiePosition,
      face,
    );
    if (anatomyColor) return anatomyColor;

    if (sticker === 'unknown') return '#374151';
    return colorHexMap[sticker];
  });

  return (
    <mesh position={[x, y, z]} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
      {materials.map((color, idx) => (
        <FaceMaterial
          key={`${x}-${y}-${z}-${idx}`}
          color={color}
          materialIndex={idx}
        />
      ))}
    </mesh>
  );
}
