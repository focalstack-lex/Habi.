import { useSyncExternalStore } from 'react';
import { catalogService } from '../services/catalogService';

const subscribe = (listener: () => void) => catalogService.subscribe(listener);
const getSnapshot = () => catalogService.getVersion();

/** Re-renders the caller whenever seller or product records change. */
export function useCatalogVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
