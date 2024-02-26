import { makeStyles } from '@fluentui/react-components';
import { ReactNode, useEffect, useState } from 'react';

import { useAppStore } from '../../store';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface InitGuardProps {
  children?: ReactNode;
}

export const InitGuard = ({ children }: InitGuardProps) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<string | undefined>('Start');

  const setSettings = useAppStore((s) => s.setSettings);
  const loadGates = useAppStore((s) => s.loadGates);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading('Settings');
        const settings = await window.electron.loadSettings();
        if (!settings) return;
        setSettings(settings);

        setLoading('Gates');
        await loadGates();
      } finally {
        setLoading(undefined);
      }
    };

    run();
  }, [setSettings, loadGates]);

  if (loading) {
    return <div className={classes.container}>{`Loading ${loading}`}</div>;
  }

  return <>{children}</>;
};
