import { NotationGuide } from '../notation/NotationGuide';
import { useLessonSessionStore } from '../../store/lessonSessionStore';

export function LessonNotationView() {
  const notationSection = useLessonSessionStore((state) => state.notationSection);
  const setNotationSection = useLessonSessionStore(
    (state) => state.setNotationSection,
  );

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-3 py-2 sm:px-4">
      <NotationGuide
        activeSection={notationSection}
        onSectionChange={setNotationSection}
      />
    </section>
  );
}
