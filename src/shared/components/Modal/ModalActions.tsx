export type ModalActionVariant = 'primary' | 'secondary' | 'ghost';

export type ModalAction = {
  label: string;
  onClick: () => void;
  variant?: ModalActionVariant;
  /** Focus this action when the modal opens. */
  autoFocus?: boolean;
};

type ModalActionsProps = {
  actions: readonly ModalAction[];
  layout?: 'end' | 'center' | 'stack';
};

const VARIANT_CLASS: Record<ModalActionVariant, string> = {
  primary:
    'rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600',
  secondary:
    'rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700',
  ghost:
    'rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-400 hover:border-slate-600 hover:bg-slate-800/60 hover:text-slate-200',
};

const LAYOUT_CLASS: Record<NonNullable<ModalActionsProps['layout']>, string> = {
  end: 'mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end',
  center: 'mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center',
  stack: 'mt-5 flex flex-col gap-2',
};

/** Renders modal action buttons; callers own labels and click handlers. */
export function ModalActions({
  actions,
  layout = 'end',
}: ModalActionsProps) {
  return (
    <div className={LAYOUT_CLASS[layout]}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={VARIANT_CLASS[action.variant ?? 'secondary']}
          data-autofocus={action.autoFocus ? 'true' : undefined}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
