import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAvoidBackDefaultPreference,
  getUiTourCompleted,
  setAvoidBackDefaultPreference,
  setUiTourCompleted,
} from '@/domains/lesson-engine/lessonPreferences';

describe('lessonPreferences', () => {
  const storage = new Map<string, string>();

  afterEach(() => {
    storage.clear();
    vi.unstubAllGlobals();
  });

  function stubStorage() {
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
    });
  }

  it('reads and writes avoid-back default', () => {
    stubStorage();

    expect(getAvoidBackDefaultPreference()).toBe(false);
    setAvoidBackDefaultPreference(true);
    expect(getAvoidBackDefaultPreference()).toBe(true);
    setAvoidBackDefaultPreference(false);
    expect(getAvoidBackDefaultPreference()).toBe(false);
  });

  it('reads and writes ui tour completed', () => {
    stubStorage();

    expect(getUiTourCompleted()).toBe(false);
    setUiTourCompleted(true);
    expect(getUiTourCompleted()).toBe(true);
    setUiTourCompleted(false);
    expect(getUiTourCompleted()).toBe(false);
  });
});
