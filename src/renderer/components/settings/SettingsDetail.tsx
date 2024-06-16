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
  const saveSettings = useAppStore((s) => s.saveSettings);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    (settings: Settings) =>
      withToast(async () => {
        await saveSettings(settings);
      }),
    [saveSettings, withToast],
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
