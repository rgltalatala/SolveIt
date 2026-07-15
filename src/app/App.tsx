import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/router';

export function App() {
  return (
    <AppProviders>
      {/* RandomScrambleLessonBar is kept for reuse; not shown on scan/correct screens. */}
      <AppRouter />
    </AppProviders>
  );
}

export default App;
