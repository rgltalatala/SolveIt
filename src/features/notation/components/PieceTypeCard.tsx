import type { CubiePieceType } from '@/domains/cube/3d/cubeAnatomy';

type PieceTypeCardProps = {
  pieceType: CubiePieceType;
  label: string;
  description: string;
  isActive: boolean;
  prefersHover: boolean;
  onActivate: (pieceType: CubiePieceType) => void;
  onDeactivate: () => void;
  onSelect: (pieceType: CubiePieceType) => void;
};

export function PieceTypeCard({
  pieceType,
  label,
  description,
  isActive,
  prefersHover,
  onActivate,
  onDeactivate,
  onSelect,
}: PieceTypeCardProps) {
  const borderClass = isActive
    ? 'border-amber-400 text-amber-100'
    : 'border-slate-600 text-slate-100';

  return (
    <button
      type="button"
      className={`flex min-w-0 w-full flex-col items-start gap-1 rounded-lg border bg-slate-950/40 px-3 py-2 text-left transition-colors hover:border-slate-500 ${borderClass}`}
      aria-pressed={isActive}
      onMouseEnter={prefersHover ? () => onActivate(pieceType) : undefined}
      onMouseLeave={prefersHover ? onDeactivate : undefined}
      onClick={() => {
        if (prefersHover) return;
        onSelect(pieceType);
      }}
      data-testid={`piece-type-card-${pieceType}`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs leading-snug wrap-break-word text-slate-400">
        {description}
      </span>
    </button>
  );
}
