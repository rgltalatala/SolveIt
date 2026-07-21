import { useEffect, useMemo, useRef, useState } from 'react';

export type LessonWorkspaceTabId = 'practice' | 'why' | 'more';

export type LessonWorkspaceMode = 'intro' | 'active' | 'complete';

type UseLessonWorkspaceTabOptions = {
  mode: LessonWorkspaceMode;
  hasPractice: boolean;
  hasBody: boolean;
  hasMore: boolean;
};

function buildVisibleTabs(
  options: UseLessonWorkspaceTabOptions,
): LessonWorkspaceTabId[] {
  const tabs: LessonWorkspaceTabId[] = [];
  if (options.hasPractice) tabs.push('practice');
  if (options.hasBody) tabs.push('why');
  if (options.hasMore) tabs.push('more');
  return tabs;
}

function defaultTab(
  options: UseLessonWorkspaceTabOptions,
  tabs: readonly LessonWorkspaceTabId[],
): LessonWorkspaceTabId | null {
  if (tabs.length === 0) return null;
  if (options.mode === 'active' && tabs.includes('practice')) return 'practice';
  if (tabs.includes('why')) return 'why';
  return tabs[0] ?? null;
}

/**
 * Lesson workspace tabs. Only one panel is shown at a time to avoid nested scrolling.
 */
export function useLessonWorkspaceTab(options: UseLessonWorkspaceTabOptions) {
  const { mode, hasPractice, hasBody, hasMore } = options;

  const tabs = useMemo(
    () => buildVisibleTabs({ mode, hasPractice, hasBody, hasMore }),
    [mode, hasPractice, hasBody, hasMore],
  );

  const [tab, setTab] = useState<LessonWorkspaceTabId | null>(() =>
    defaultTab(options, tabs),
  );
  const prevModeRef = useRef(mode);

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
      setTab(defaultTab({ mode, hasPractice, hasBody, hasMore }, tabs));
      return;
    }
    if (tab !== null && !tabs.includes(tab)) {
      setTab(defaultTab({ mode, hasPractice, hasBody, hasMore }, tabs));
    } else if (tab === null && tabs.length > 0) {
      setTab(defaultTab({ mode, hasPractice, hasBody, hasMore }, tabs));
    }
  }, [tabs, tab, mode, hasPractice, hasBody, hasMore]);

  return {
    tab:
      tab !== null && tabs.includes(tab)
        ? tab
        : defaultTab({ mode, hasPractice, hasBody, hasMore }, tabs),
    setTab: (next: LessonWorkspaceTabId) => setTab(next),
    tabs,
  };
}
