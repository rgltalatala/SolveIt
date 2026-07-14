import type { ReactNode } from 'react';

type LearningSplitLayoutProps = {
  cube: ReactNode;
  sidebar: ReactNode;
  /** Extra class on the outer frame (e.g. padding). */
  className?: string;
};

/**
 * Viewport-aware cube + workspace split.
 * Desktop: ~62% / 38% columns filling parent height.
 * Mobile: cube on top (bounded height), workspace fills remaining space.
 */
export function LearningSplitLayout({
  cube,
  sidebar,
  className = '',
}: LearningSplitLayoutProps) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-5 ${className}`}
    >
      <div className="flex h-[min(28dvh,220px)] shrink-0 flex-col min-h-[160px] lg:h-full lg:min-h-0 lg:shrink">
        <div className="flex h-full min-h-0 flex-col">{cube}</div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:h-full">
        {sidebar}
      </div>
    </div>
  );
}

/** Fluid cube canvas that fills its parent column. */
export const LEARNING_CUBE_FRAME_CLASS =
  'h-full min-h-0 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950';
