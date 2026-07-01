type CaseReferenceCardProps = {
  caseId: string;
  title: string;
  alg: string;
  isSelected: boolean;
  onClick: () => void;
};

export function CaseReferenceCard({
  caseId,
  title,
  alg,
  isSelected,
  onClick,
}: CaseReferenceCardProps) {
  const borderClass = isSelected
    ? 'border-cyan-300 text-cyan-100'
    : 'border-slate-600 text-slate-100';

  return (
    <button
      type="button"
      className={`flex min-w-36 flex-col items-start gap-1 rounded-lg border bg-slate-950/40 px-3 py-2 text-left transition-colors hover:border-slate-500 ${borderClass}`}
      aria-pressed={isSelected}
      data-testid={`case-card-${caseId}`}
      onClick={onClick}
    >
      <span className="text-sm font-semibold">{title}</span>
      <span className="font-mono text-xs leading-snug text-slate-400">{alg}</span>
    </button>
  );
}
