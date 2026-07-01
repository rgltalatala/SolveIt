import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import {
  hydrateLessonSession,
  startLessonSessionPersistence,
} from './learn/lessonSessionPersistence';
import { App } from './ui/App';

hydrateLessonSession();
startLessonSessionPersistence();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
