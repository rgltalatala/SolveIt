import { RandomScrambleLessonBar } from './RandomScrambleLessonBar';
import { ReferenceShell } from './ReferenceShell';
import { useCubeStore } from '../store/cubeStore';

export function App() {
  const appPhase = useCubeStore((state) => state.appPhase);

  return (
    <>
      {appPhase === 'scanning' || appPhase === 'correcting' ? (
        <RandomScrambleLessonBar />
      ) : null}
      <ReferenceShell />
    </>
  );
}

export default App;
