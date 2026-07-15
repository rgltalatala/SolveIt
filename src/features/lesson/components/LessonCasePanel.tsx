type LessonCasePanelProps = {
  title: string;
  dimmed?: boolean;
  children?: React.ReactNode;
};

/** Compact case title strip above the lesson workspace tabs. */
export function LessonCasePanel({
  title,
  dimmed,
  children,
}: LessonCasePanelProps) {
  return (
    <section className={`px-0.5 ${dimmed ? 'opacity-60' : ''}`}>
      <h2 className="text-base font-semibold leading-snug text-slate-100 sm:text-lg">
        {title}
      </h2>
      {children}
    </section>
  );
}
