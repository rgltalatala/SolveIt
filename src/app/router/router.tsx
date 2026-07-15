import { Navigate, Route, Routes } from 'react-router';
import { CasesPage } from '@/features/cases/pages/CasesPage';
import { HomePage } from '@/app/pages/HomePage';
import { LastLayerLessonPage, LessonPage } from '@/features/lesson/pages/LessonPage';
import { LearnIndexRedirect } from '@/features/lesson/pages/LearnIndexRedirect';
import { NotationPage } from '@/features/notation/pages/NotationPage';
import { AppLayout } from '@/app/layouts/AppLayout';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnIndexRedirect />} />
        <Route path="learn/last-layer/:subLessonId" element={<LastLayerLessonPage />} />
        <Route path="learn/last-layer" element={<LastLayerLessonPage />} />
        <Route path="learn/:lessonId" element={<LessonPage />} />
        <Route path="notation" element={<NotationPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
