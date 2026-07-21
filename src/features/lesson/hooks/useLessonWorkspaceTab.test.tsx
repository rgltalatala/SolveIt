import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLessonWorkspaceTab } from '@/features/lesson/hooks/useLessonWorkspaceTab';
import { lessonLayout } from '@/content/beginner/tips';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonWorkspaceTabs } from '@/features/lesson/components/LessonWorkspaceTabs';

describe('useLessonWorkspaceTab', () => {
  it('defaults intro to why when body is present', () => {
    const { result } = renderHook(() =>
      useLessonWorkspaceTab({
        mode: 'intro',
        hasPractice: false,
        hasBody: true,
        hasMore: true,
      }),
    );
    expect(result.current.tab).toBe('why');
    expect(result.current.tabs).toEqual(['why', 'more']);
  });

  it('defaults active solve to practice when available', () => {
    const { result } = renderHook(() =>
      useLessonWorkspaceTab({
        mode: 'active',
        hasPractice: true,
        hasBody: true,
        hasMore: true,
      }),
    );
    expect(result.current.tabs).toEqual(['practice', 'why', 'more']);
    expect(result.current.tab).toBe('practice');
  });

  it('returns empty tabs when no content', () => {
    const { result } = renderHook(() =>
      useLessonWorkspaceTab({
        mode: 'active',
        hasPractice: false,
        hasBody: false,
        hasMore: false,
      }),
    );
    expect(result.current.tabs).toEqual([]);
    expect(result.current.tab).toBeNull();
  });
});

describe('LessonWorkspaceTabs', () => {
  it('renders practice and why tabs', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <LessonWorkspaceTabs
        tabs={['practice', 'why', 'more']}
        activeTab="practice"
        onChange={onChange}
      />,
    );
    expect(
      screen.getByRole('tab', { name: lessonLayout.workspaceTabs.practice }),
    ).toHaveAttribute('aria-selected', 'true');
    await user.click(
      screen.getByRole('tab', { name: lessonLayout.workspaceTabs.why }),
    );
    expect(onChange).toHaveBeenCalledWith('why');
  });
});
