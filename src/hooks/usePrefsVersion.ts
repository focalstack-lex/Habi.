import { useSyncExternalStore } from 'react';
import { userPrefsService } from '../services/userPrefsService';

const subscribe = (listener: () => void) => userPrefsService.subscribe(listener);
const getSnapshot = () => userPrefsService.getVersion();

/** Re-renders the caller whenever buyer preferences, boards, or alerts change. */
export function usePrefsVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
