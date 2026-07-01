import { useMemo, useState } from 'react';
import { CubeView } from '../../cube3d/CubeView';
import { learningNav } from '../../content/learningNav';
import {
  getAllCaseReferenceSections,
  getCaseById,
  getCaseDemo,
  type CaseReferenceEntry,
} from '../../content/caseReference';
import { solvedStudentFrameCube } from '../../learn/studentFrame';
import { MoveSequenceDemo } from '../MoveSequenceDemo';
import { CaseReferenceCard } from './CaseReferenceCard';

export function CasesReferenceView() {
  const sections = getAllCaseReferenceSections();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const selectedCase = useMemo(
    () => (selectedCaseId ? getCaseById(selectedCaseId) : null),
    [selectedCaseId],
  );

  const caseDemo = useMemo(
    () => (selectedCase ? getCaseDemo(selectedCase) : null),
    [selectedCase],
  );

  const fallbackCube = solvedStudentFrameCube();
  const cubeFrameClass =
    'h-[320px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 lg:h-[420px]';

  const handleCaseClick = (entry: CaseReferenceEntry) => {
    setSelectedCaseId((current) => (current === entry.id ? null : entry.id));
  };

  return (
    <section className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <p className="mb-4 text-sm text-slate-300">{learningNav.casesIntro}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {selectedCase && caseDemo ? (
            <MoveSequenceDemo
              baseCubeState={caseDemo.setupCube}
              moves={caseDemo.moves}
              instructions={caseDemo.instructions}
              instructionPhaseLengths={caseDemo.instructionPhaseLengths}
              meshRotation={[0, 0, 0]}
              frameClassName={cubeFrameClass}
            />
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <h3 className="text-sm font-semibold text-slate-200">
                {learningNav.casesSelectHeading}
              </h3>
              <CubeView
                cubeState={fallbackCube}
                meshRotation={[0, 0, 0]}
                frameClassName={cubeFrameClass}
                canvasKey="case-reference-idle"
                cameraBaselineKey="case-reference-idle"
                snapCameraOnWholeCubeRotation={false}
                enableOrbitControls={false}
              />
              <p className="text-xs text-slate-500">{learningNav.casesSelectHint}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.lessonTitle} className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-slate-100">
                {section.lessonTitle}
              </h2>
              {section.groups.map((group) => (
                <div
                  key={`${section.lessonTitle}-${group.heading}`}
                  className="flex flex-col gap-3"
                >
                  <h3 className="text-base font-medium text-slate-200">
                    {group.heading}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {group.cases.map((caseEntry) => (
                      <CaseReferenceCard
                        key={caseEntry.id}
                        caseId={caseEntry.id}
                        title={caseEntry.title}
                        alg={caseEntry.alg}
                        isSelected={selectedCaseId === caseEntry.id}
                        onClick={() => handleCaseClick(caseEntry)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
