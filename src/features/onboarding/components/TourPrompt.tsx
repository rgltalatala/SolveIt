import { useEffect, useId, useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { lessonUiTour } from '@/content/beginner/lessonUiTour';

type TourPromptOptions = {
  dontShowAgain?: boolean;
};

type TourPromptProps = {
  open: boolean;
  onStart: (options?: TourPromptOptions) => void;
  onDecline: (options?: TourPromptOptions) => void;
};

/** First-run prompt: start the lesson chrome tour or skip, with optional don't-show-again. */
export function TourPrompt({ open, onStart, onDecline }: TourPromptProps) {
  const { prompt } = lessonUiTour;
  const checkboxId = useId();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (open) setDontShowAgain(false);
  }, [open]);

  const options = (): TourPromptOptions | undefined =>
    dontShowAgain ? { dontShowAgain: true } : undefined;

  return (
    <Modal
      open={open}
      title={prompt.title}
      body={prompt.body}
      onDismiss={() => onDecline(options())}
      afterActions={
        <label
          htmlFor={checkboxId}
          className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-300"
        >
          <input
            id={checkboxId}
            type="checkbox"
            className="rounded border-slate-600 accent-emerald-600"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
          />
          {prompt.dontShowAgain}
        </label>
      }
      actions={[
        {
          label: prompt.start,
          onClick: () => onStart(options()),
          variant: 'primary',
        },
        {
          label: prompt.decline,
          onClick: () => onDecline(options()),
          variant: 'secondary',
          autoFocus: true,
        },
      ]}
    />
  );
}
