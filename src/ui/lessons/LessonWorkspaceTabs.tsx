import { lessonLayout } from '../../content/tips';
import type { LessonWorkspaceTabId } from './useLessonWorkspaceTab';

const TAB_LABELS: Record<LessonWorkspaceTabId, string> = {
  practice: lessonLayout.workspaceTabs.practice,
  why: lessonLayout.workspaceTabs.why,
  hints: lessonLayout.workspaceTabs.hints,
  more: lessonLayout.workspaceTabs.more,
};

type LessonWorkspaceTabsProps = {
  tabs: readonly LessonWorkspaceTabId[];
  activeTab: LessonWorkspaceTabId | null;
  onChange: (tab: LessonWorkspaceTabId) => void;
};

export function LessonWorkspaceTabs({
  tabs,
  activeTab,
  onChange,
}: LessonWorkspaceTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div
      className="flex shrink-0 gap-1 overflow-x-auto pb-0.5"
      role="tablist"
      aria-label="Lesson workspace"
    >
      {tabs.map((id) => {
        const isActive = id === activeTab;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-emerald-600 bg-emerald-950/50 text-emerald-100'
                : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
            onClick={() => onChange(id)}
          >
            {TAB_LABELS[id]}
          </button>
        );
      })}
    </div>
  );
}
