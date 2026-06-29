import type { Face } from '../../cube/cubeState';

type FaceNameCardProps = {
  letter: Face;
  label: string;
  isActive: boolean;
  prefersHover: boolean;
  onActivate: (face: Face) => void;
  onDeactivate: () => void;
  onSelect: (face: Face) => void;
};

export function FaceNameCard({
  letter,
  label,
  isActive,
  prefersHover,
  onActivate,
  onDeactivate,
  onSelect,
}: FaceNameCardProps) {
  const borderClass = isActive
    ? 'border-cyan-300 text-cyan-100'
    : 'border-slate-600 text-slate-100';

  return (
    <button
      type="button"
      className={`flex flex-col items-start gap-1 rounded-lg border bg-slate-950/40 px-3 py-2 text-left transition-colors hover:border-slate-500 ${borderClass}`}
      aria-pressed={isActive}
      onMouseEnter={prefersHover ? () => onActivate(letter) : undefined}
      onMouseLeave={prefersHover ? onDeactivate : undefined}
      onClick={() => {
        if (prefersHover) return;
        onSelect(letter);
      }}
      data-testid={`face-name-card-${letter}`}
    >
      <span className="font-mono text-sm font-semibold">{letter}</span>
      <span className="text-xs leading-snug text-slate-400">{label}</span>
    </button>
  );
}
