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
  const loadGates = useAppStore((s) => s.loadGates);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    async (settings: Settings) => {
      setSettings(settings);
      await withToast(() => window.electron.saveSettings(settings));
      // TODO needs global loading(status) indicator?
      await loadGates();
    },
    [loadGates, setSettings, withToast],
  );

  const handleClickOpenSettingsFile = useCallback(
    () => window.electron.openSettingsFile(),
    [],
  );

  const handleClickOpenLogFile = useCallback(
    () => window.electron.openLogFile(),
    [],
  );

  return (
    <>
      <div className={classes.container}>
        <SettingsDetailView
          settings={settings}
          onSubmit={handleSubmit}
          onClickOpenSettingsFile={handleClickOpenSettingsFile}
          onClickOpenLogFile={handleClickOpenLogFile}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
