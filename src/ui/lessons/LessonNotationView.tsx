import { NotationGuide } from '../notation/NotationGuide';
import { useLessonSessionStore } from '../../store/lessonSessionStore';

export function LessonNotationView() {
  const notationSection = useLessonSessionStore((state) => state.notationSection);
  const setNotationSection = useLessonSessionStore(
    (state) => state.setNotationSection,
  );

  return (
    <section className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <NotationGuide
        activeSection={notationSection}
        onSectionChange={setNotationSection}
      />
    </section>
  );
}
