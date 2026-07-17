import { cubePrompt } from '@/content/onboarding/onboarding';
import { useCubeStore } from '@/app/store/cubeStore';

/** Ask whether the physical cube is scrambled (scan) or solved (provide scramble). */
export function CubePromptPanel() {
  const setAppPhase = useCubeStore((state) => state.setAppPhase);

  return (
    <section className="flex min-h-full w-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-center shadow-lg shadow-slate-950/40">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-100">{cubePrompt.title}</h1>
          <p className="text-slate-300">{cubePrompt.body}</p>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            onClick={() => setAppPhase('scanning')}
          >
            {cubePrompt.scrambled}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            onClick={() => setAppPhase('scrambleSetup')}
          >
            {cubePrompt.solved}
          </button>
        </div>
      </div>
    </section>
  );
}
