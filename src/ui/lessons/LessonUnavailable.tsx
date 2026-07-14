import { useState } from 'react';
import { learningNav } from '../../content/learningNav';
import { lessonUnavailable, ui } from '../../content/ui';
import { useLessonNavigation } from '../../lessons/useLessonNavigation';
import { ConfirmModal } from '../ConfirmModal';

export function LessonUnavailable() {
  const { restartFromBeginning } = useLessonNavigation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">{lessonUnavailable.title}</h1>
      <p className="text-slate-300">{lessonUnavailable.body}</p>
      <button
        type="button"
        className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
        onClick={() => setConfirmOpen(true)}
      >
        {ui.reset}
      </button>
      <ConfirmModal
        open={confirmOpen}
        title={learningNav.restartConfirmTitle}
        body={learningNav.restartConfirm}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          restartFromBeginning();
        }}
      />
    </section>
  );
}
