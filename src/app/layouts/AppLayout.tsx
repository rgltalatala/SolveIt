import { Outlet } from 'react-router';
import { LessonTopNav } from '@/app/layouts/LessonTopNav';
import { madeBy } from '@/content/onboarding/ui';
import { useCubeStore } from '@/app/store/cubeStore';

export function AppLayout() {
  const appPhase = useCubeStore((state) => state.appPhase);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <LessonTopNav showEndLesson={appPhase === 'learning'} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      <p className="pointer-events-none absolute bottom-2 right-3 z-10 text-xs text-slate-500">
        {madeBy.prefix}
        <a
          href={madeBy.href}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto underline hover:text-slate-400"
        >
          {madeBy.name}
        </a>
      </p>
    </div>
  );
}
