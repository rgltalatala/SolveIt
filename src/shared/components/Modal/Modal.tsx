import { useEffect, useId, useRef, type ReactNode } from 'react';
import {
  ModalActions,
  type ModalAction,
} from '@/shared/components/Modal/ModalActions';

export type ModalProps = {
  open: boolean;
  title: string;
  body: ReactNode;
  actions: readonly ModalAction[];
  /** Optional content after the action buttons (e.g. a preference checkbox). */
  afterActions?: ReactNode;
  /**
   * Escape / backdrop dismiss. When omitted, Escape and backdrop clicks do nothing
   * (useful for required choices like cube state).
   */
  onDismiss?: () => void;
  /** overlay = fixed dimmed backdrop (default); page = centered card in parent. */
  presentation?: 'overlay' | 'page';
  /** Action row layout. Default: end (overlay) / center (page). */
  actionsLayout?: 'end' | 'center' | 'stack';
};

/**
 * Shared dialog shell: layout, overlay behavior, and action rendering.
 * Feature code supplies title, body, and action handlers.
 */
export function Modal({
  open,
  title,
  body,
  actions,
  afterActions,
  onDismiss,
  presentation = 'overlay',
  actionsLayout,
}: ModalProps) {
  const titleId = useId();
  const bodyId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;

    const focusTarget =
      panelRef.current?.querySelector<HTMLButtonElement>(
        'button[data-autofocus="true"]',
      ) ?? panelRef.current?.querySelector<HTMLButtonElement>('button');
    focusTarget?.focus();

    if (!onDismiss) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismissRef.current?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onDismiss, actions]);

  if (!open) return null;

  const layout =
    actionsLayout ?? (presentation === 'page' ? 'center' : 'end');

  const card = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={presentation === 'overlay' ? true : undefined}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className={
        presentation === 'page'
          ? 'w-full max-w-md space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-center shadow-lg shadow-slate-950/40'
          : 'w-full max-w-md rounded-xl border border-slate-600 bg-slate-900 p-5 shadow-xl shadow-slate-950/50'
      }
      onClick={
        presentation === 'overlay'
          ? (event) => event.stopPropagation()
          : undefined
      }
    >
      <h2
        id={titleId}
        className={
          presentation === 'page'
            ? 'text-2xl font-bold text-slate-100'
            : 'text-lg font-semibold text-slate-100'
        }
      >
        {title}
      </h2>
      <div
        id={bodyId}
        className={
          presentation === 'page'
            ? 'text-slate-300'
            : 'mt-2 text-sm text-slate-300'
        }
      >
        {typeof body === 'string' ? <p>{body}</p> : body}
      </div>
      <ModalActions actions={actions} layout={layout} />
      {afterActions}
    </div>
  );

  if (presentation === 'page') {
    return (
      <section className="flex min-h-full w-full flex-1 items-center justify-center p-6">
        {card}
      </section>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onDismiss}
    >
      {card}
    </div>
  );
}
