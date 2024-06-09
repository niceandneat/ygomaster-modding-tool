import { useEffect, useMemo } from 'react';
import { BlockerFunction, useBlocker } from 'react-router-dom';

export const useWarnNavigation = (shouldBlock: boolean) => {
  const handleBlock = useMemo<boolean | BlockerFunction>(
    () =>
      shouldBlock &&
      (({ currentLocation, nextLocation }) =>
        currentLocation.pathname !== nextLocation.pathname),
    [shouldBlock],
  );

  const blocker = useBlocker(handleBlock);

  useEffect(() => {
    if (!shouldBlock || blocker.state !== 'blocked') {
      return blocker.proceed?.();
    }

    const run = async () => {
      const response = await window.electron.showMessageBox({
        message: 'Are you sure you want to leave?',
        detail: 'Changes that you made may not be saved.',
        buttons: ['leave', 'stay'],
        cancelId: 1,
      });

      if (response === 0) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    };

    run();
  }, [blocker, shouldBlock]);

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
