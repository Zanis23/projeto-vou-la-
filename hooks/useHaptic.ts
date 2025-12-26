import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

export const useHaptic = () => {
  const trigger = useCallback((type: HapticType = 'light') => {
    if (!navigator.vibrate) return;

    switch (type) {
      case 'light':
        navigator.vibrate(10); // Quick tick
        break;
      case 'medium':
        navigator.vibrate(40); // Noticeable tap
        break;
      case 'heavy':
        navigator.vibrate(70); // Heavy thud
        break;
      case 'success':
        navigator.vibrate([30, 50, 30]); // Da-da-da pattern
        break;
      case 'error':
        navigator.vibrate([50, 30, 50, 30, 50]); // Buzz-buzz-buzz
        break;
    }
  }, []);

  return { trigger };
};