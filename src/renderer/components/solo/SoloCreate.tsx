import { Toaster, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';

import { Solo } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { withMessageBox } from '../../utils/withMessageBox';
import { SoloDetailView } from './SoloDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
  },
});

export const SoloCreate = () => {
  const classes = useStyles();
  const loadSolos = useAppStore((s) => s.loadSolos);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    (solo: Solo) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.createSolo({ solo });
          await loadSolos();
        }),
      ),
    [withToast, loadSolos],
  );

  const title = 'Create Solo';

  return (
    <>
      <div className={classes.container}>
        <SoloDetailView title={title} onSubmit={handleSubmit} />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
