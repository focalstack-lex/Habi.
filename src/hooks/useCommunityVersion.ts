import { useSyncExternalStore } from 'react';
import { communityService } from '../services/communityService';

const subscribe = (listener: () => void) => communityService.subscribe(listener);
const getSnapshot = () => communityService.getVersion();

/** Re-renders the caller whenever fit checks, likes, or comments change. */
export function useCommunityVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
