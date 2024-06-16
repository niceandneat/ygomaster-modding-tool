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
  const [loading, setLoading] = useState<boolean>(true);

  const loadSettings = useAppStore((s) => s.loadSettings);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await loadSettings();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [loadSettings]);

  if (loading) {
    return <div className={classes.container}>Loading</div>;
  }

  return <>{children}</>;
};
