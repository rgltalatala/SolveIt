import { Outlet } from 'react-router';
import { LessonTopNav } from '@/app/layouts/LessonTopNav';
import { useCubeStore } from '@/app/store/cubeStore';

export function AppLayout() {
  const appPhase = useCubeStore((state) => state.appPhase);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <LessonTopNav showEndLesson={appPhase === 'learning'} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
