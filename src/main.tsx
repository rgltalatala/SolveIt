import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import {
  hydrateLessonSession,
  startLessonSessionPersistence,
} from '@/features/lesson/store/lessonSessionPersistence';
import { App } from '@/app/App';

hydrateLessonSession();
startLessonSessionPersistence();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
