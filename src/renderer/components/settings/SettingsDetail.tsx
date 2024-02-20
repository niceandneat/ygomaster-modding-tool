import { Toaster, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';

import { Settings } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { SettingsDetailView } from './SettingsDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
  },
});

export const SettingsDetail = () => {
  const classes = useStyles();
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    async (settings: Settings) => {
      setSettings(settings);
      await withToast(() => window.electron.saveSettings(settings));
    },
    [setSettings, withToast],
  );

  return (
    <>
      <div className={classes.container}>
        <SettingsDetailView settings={settings} onSubmit={handleSubmit} />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
