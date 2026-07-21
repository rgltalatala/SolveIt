import type { ReactNode } from 'react';
import type { Color } from '@/domains/cube/cubeState';
import { formatColorLabel } from '@/domains/cube/cubeState';
import {
  lessonLayout,
  PHYSICAL_CUBE_MATCH_NOTE,
  REORIENT_HOLD_NOTE,
  SAME_HOLD_NOTE,
} from '@/content/beginner/tips';
import { LessonAvoidBackPanel } from '@/features/lesson/components/LessonAvoidBackPanel';

type FaceCenters = {
  F: Color;
  U: Color;
  D: Color;
};

type LessonSecondaryPanelsProps = {
  lessonHold: FaceCenters;
  showOrientationPanel?: boolean;
  showSameHoldNote?: boolean;
  showReorientNote?: boolean;
  orientationExtra?: ReactNode;
  avoidBack?: {
    frontColor: Color;
    avoidBackMoves: boolean;
    onToggleAvoidBack: () => void;
    rememberAvoidBackDefault: boolean;
    onRememberDefaultChange: (on: boolean) => void;
    showRotationCallout: boolean;
    onMarkCalloutSeen: () => void;
    holdNote?: string;
  };
};

export function LessonSecondaryPanels({
  lessonHold,
  showOrientationPanel = true,
  showSameHoldNote,
  showReorientNote,
  orientationExtra,
  avoidBack,
}: LessonSecondaryPanelsProps) {
  const fLabel = formatColorLabel(lessonHold.F);
  const uLabel = formatColorLabel(lessonHold.U);
  const dLabel = formatColorLabel(lessonHold.D);

  return (
    <div className="flex flex-col gap-2">
      {showOrientationPanel ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs leading-relaxed text-slate-400">
          <p className="text-sm text-slate-300">{lessonLayout.cubeOrientationPanel}</p>
          <div className="mt-2 space-y-2">
            <p>
              Hold your cube with{' '}
              <span className="text-slate-300">white on the bottom</span> and{' '}
              <span className="text-slate-300">yellow on top</span>. Face{' '}
              <span className="text-slate-300">{fLabel} toward you</span>. That
              is the <span className="text-slate-300">front (F)</span> face in
              the diagram. Notation: U = {uLabel}, D = {dLabel}, F = {fLabel}.
            </p>
            <p>{PHYSICAL_CUBE_MATCH_NOTE}</p>
            {showSameHoldNote ? (
              <p>{SAME_HOLD_NOTE(fLabel, uLabel, dLabel)}</p>
            ) : null}
            {showReorientNote ? (
              <p className="text-slate-500">{REORIENT_HOLD_NOTE}</p>
            ) : null}
            {orientationExtra}
          </div>
        </div>
      ) : null}

      {avoidBack ? (
        <details
          className="rounded-lg border border-slate-800 bg-slate-950/40"
          open={avoidBack.avoidBackMoves}
        >
          <summary className="cursor-pointer px-3 py-2 text-sm text-slate-400 hover:text-slate-200">
            Skip back-face turns
          </summary>
          <div className="border-t border-slate-800 p-3">
            <LessonAvoidBackPanel
              frontColor={avoidBack.frontColor}
              avoidBackMoves={avoidBack.avoidBackMoves}
              onToggleAvoidBack={avoidBack.onToggleAvoidBack}
              rememberAvoidBackDefault={avoidBack.rememberAvoidBackDefault}
              onRememberDefaultChange={avoidBack.onRememberDefaultChange}
              showRotationCallout={avoidBack.showRotationCallout}
              onMarkCalloutSeen={avoidBack.onMarkCalloutSeen}
              holdNote={avoidBack.holdNote}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}
