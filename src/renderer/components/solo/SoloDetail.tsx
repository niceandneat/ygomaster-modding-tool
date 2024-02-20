import { Toaster, makeStyles } from '@fluentui/react-components';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Solo } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { toAbsolutePath } from '../../utils/toAbsolutePath';
import { withMessageBox } from '../../utils/withMessageBox';
import { SoloDetailView } from './SoloDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
  },
});

export const SoloDetail = () => {
  const classes = useStyles();
  const activeSolo = useAppStore((s) => s.activeSolo);
  const loadActiveSolo = useAppStore((s) => s.loadActiveSolo);
  const loadSolos = useAppStore((s) => s.loadSolos);
  const { soloPath } = useAppStore((s) => s.settings);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');
  const params = useParams();

  const fileName = params['*'] || 'UNKNOWN_PATH';
  const filePath = toAbsolutePath(fileName, soloPath);

  const handleSubmit = useCallback(
    (solo: Solo) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.updateSolo({ solo, filePath });
          await loadSolos();
        }),
      ),
    [withToast, filePath, loadSolos],
  );

  useEffect(() => {
    loadActiveSolo(filePath);
  }, [loadActiveSolo, filePath]);

  return (
    <>
      <div className={classes.container}>
        <SoloDetailView
          title={fileName}
          solo={activeSolo}
          onSubmit={handleSubmit}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
