const AVOID_BACK_DEFAULT_KEY = 'solving-it.lesson.avoidBackDefault';
const UI_TOUR_COMPLETED_KEY = 'solving-it.lesson.uiTourCompleted';

/** Whether to turn on "avoid back face" automatically when a step's demo includes B. */
export function getAvoidBackDefaultPreference(): boolean {
  try {
    return localStorage.getItem(AVOID_BACK_DEFAULT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAvoidBackDefaultPreference(enabled: boolean): void {
  try {
    localStorage.setItem(AVOID_BACK_DEFAULT_KEY, enabled ? 'true' : 'false');
  } catch {
    // private mode / blocked storage
  }
}

/** Whether the user finished the lesson chrome tour or opted out permanently. */
export function getUiTourCompleted(): boolean {
  try {
    return localStorage.getItem(UI_TOUR_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setUiTourCompleted(completed: boolean): void {
  try {
    localStorage.setItem(UI_TOUR_COMPLETED_KEY, completed ? 'true' : 'false');
  } catch {
    // private mode / blocked storage
  }
}
