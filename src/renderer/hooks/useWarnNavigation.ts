import { useCallback, useEffect } from 'react';
import { BlockerFunction, useBlocker } from 'react-router-dom';

export const useWarnNavigation = (shouldBlock: boolean) => {
  const handleBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) => {
      return currentLocation.pathname !== nextLocation.pathname && shouldBlock;
    },
    [shouldBlock],
  );

  const blocker = useBlocker(handleBlock);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    const run = async () => {
      const response = await window.electron.showMessageBox({
        message: 'Are you sure you want to leave?',
        detail: 'Changes that you made may not be saved.',
        buttons: ['leave', 'stay'],
        cancelId: 1,
      });

      if (response === 0) {
        blocker.proceed();
      }
    };

    run();
  }, [blocker]);

  useEffect(() => {
    if (!shouldBlock) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [shouldBlock]);

  return blocker.state === 'blocked';
};
