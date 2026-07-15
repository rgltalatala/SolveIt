import type { ReactNode } from 'react';

type LessonApplyButtonProps = {
  buttonLabel: string;
  disabled: boolean;
  onApply: () => void;
  fullWidth?: boolean;
};

export function LessonApplyButton({
  buttonLabel,
  disabled,
  onApply,
  fullWidth = false,
}: LessonApplyButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 ${
        fullWidth ? 'w-full justify-center' : 'shrink-0'
      }`}
      onClick={onApply}
    >
      {buttonLabel}
    </button>
  );
}

type LessonApplyFooterProps = {
  canApply: boolean;
  applyLabel: string;
  applyHint?: string;
  disabled?: boolean;
  onApply: () => void;
  /** When set, replaces the apply button (intro continue, prerequisite links, etc.). */
  alternateActions?: ReactNode;
};

/** Sticky Continue / Apply footer for the lesson workspace. */
export function LessonApplyFooter({
  canApply,
  applyLabel,
  applyHint,
  disabled,
  onApply,
  alternateActions,
}: LessonApplyFooterProps) {
  if (alternateActions) {
    return <div className="shrink-0 pt-2">{alternateActions}</div>;
  }
  if (!canApply) return null;
  return (
    <div className="shrink-0 border-t border-slate-800 pt-2">
      <div className="flex flex-col gap-1.5">
        <LessonApplyButton
          buttonLabel={applyLabel}
          disabled={disabled ?? false}
          onApply={onApply}
          fullWidth
        />
        {applyHint ? (
          <p className="text-center text-xs text-slate-500">{applyHint}</p>
        ) : null}
      </div>
    </div>
  );
}
