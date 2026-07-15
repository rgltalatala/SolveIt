import { parseFaceTurnAlgToMoves } from '@/domains/cube/parseFaceTurnAlg';
import type { Move } from '@/domains/cube/cubeState';

export const PERMUTE_EDGES_ALG: Move[] = parseFaceTurnAlgToMoves(
  "R U R' U R U2 R' U",
);
