type PositionLabelCardProps = {
  label: string;
  description: string;
  isActive: boolean;
  prefersHover: boolean;
  onActivate: (label: string) => void;
  onDeactivate: () => void;
  onSelect: (label: string) => void;
};

export function PositionLabelCard({
  label,
  description,
  isActive,
  prefersHover,
  onActivate,
  onDeactivate,
  onSelect,
}: PositionLabelCardProps) {
  const borderClass = isActive
    ? 'border-violet-300 text-violet-100'
    : 'border-slate-600 text-slate-100';

  return (
    <button
      type="button"
      className={`flex min-w-0 w-full flex-col items-start gap-1 rounded-lg border bg-slate-950/40 px-3 py-2 text-left transition-colors hover:border-slate-500 ${borderClass}`}
      aria-pressed={isActive}
      onMouseEnter={prefersHover ? () => onActivate(label) : undefined}
      onMouseLeave={prefersHover ? onDeactivate : undefined}
      onClick={() => {
        if (prefersHover) return;
        onSelect(label);
      }}
      data-testid={`position-label-card-${label}`}
    >
      <span className="font-mono text-sm font-semibold">{label}</span>
      <span className="text-xs leading-snug wrap-break-word text-slate-400">
        {description}
      </span>
    </button>
  );
}
