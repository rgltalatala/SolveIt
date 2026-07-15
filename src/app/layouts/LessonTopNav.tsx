import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { learningNav } from '@/content/onboarding/learningNav';
import { currentLessonPath } from '@/features/lesson/lessonLoader';
import { useLessonNavigation } from '@/features/lesson/hooks/useLessonNavigation';
import { useCubeStore } from '@/app/store/cubeStore';
import { ConfirmModal } from '@/shared/components/ConfirmModal';

type NavSection = 'learn' | 'notation' | 'cases';

const SECTIONS: { id: NavSection; label: string; to: string }[] = [
  { id: 'learn', label: learningNav.learnTab, to: '/' },
  { id: 'notation', label: learningNav.notationTab, to: '/notation' },
  { id: 'cases', label: learningNav.casesTab, to: '/cases' },
];

type LessonTopNavProps = {
  showEndLesson?: boolean;
};

function sectionFromPathname(pathname: string): NavSection {
  if (pathname.startsWith('/notation')) return 'notation';
  if (pathname.startsWith('/cases')) return 'cases';
  return 'learn';
}

export function LessonTopNav({ showEndLesson = false }: LessonTopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const appPhase = useCubeStore((state) => state.appPhase);
  const { restartFromBeginning } = useLessonNavigation();
  const activeSection = sectionFromPathname(location.pathname);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openRestartConfirm = () => setConfirmOpen(true);

  const learnTabTo = appPhase === 'learning' ? currentLessonPath() : '/';

  return (
    <>
      <header className="z-20 shrink-0 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-1.5 px-3 py-2 sm:gap-2 sm:px-4">
          <div className="shrink-0 rounded-lg border border-slate-600 bg-slate-800 p-1">
            <img
              src="/home-cube.png"
              alt=""
              className="h-7 w-7 object-contain"
            />
          </div>
          <div
            className="flex min-w-0 flex-1 items-center gap-1 sm:gap-1.5"
            role="tablist"
            aria-label="Learn sections"
          >
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const to = section.id === 'learn' ? learnTabTo : section.to;
              return (
                <NavLink
                  key={section.id}
                  to={to}
                  role="tab"
                  aria-selected={isActive}
                  className={`min-w-0 flex-1 truncate rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:rounded-full sm:px-3 sm:py-1 sm:text-sm ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-950/50 text-emerald-100'
                      : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                  }`}
                  onClick={(event) => {
                    // Keep Learn tab pointing at the live lesson path even if the
                    // NavLink was rendered with a stale `to` before learning started.
                    if (section.id === 'learn') {
                      const next =
                        useCubeStore.getState().appPhase === 'learning'
                          ? currentLessonPath()
                          : '/';
                      if (next !== to) {
                        event.preventDefault();
                        navigate(next);
                      }
                    }
                  }}
                >
                  {section.label}
                </NavLink>
              );
            })}
          </div>
          {showEndLesson ? (
            <button
              type="button"
              className="shrink-0 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 sm:px-2.5 sm:py-1 sm:text-sm"
              onClick={openRestartConfirm}
            >
              <span className="sm:hidden">End</span>
              <span className="hidden sm:inline">{learningNav.endLesson}</span>
            </button>
          ) : null}
        </div>
      </header>
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
    </>
  );
}
