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
        message:
          'Are you sure you want to leave?\nYour form completion will be deleted.',
        buttons: ['leave', 'stay'],
        cancelId: 1,
      });

      if (response === 0) {
        blocker.proceed();
      }
    };

    run();
  }, [blocker]);

  return blocker.state === 'blocked';
};
