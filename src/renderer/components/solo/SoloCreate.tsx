import { Toaster, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';

import { Solo } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { SoloDetailView } from './SoloDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
  },
});

export const SoloCreate = () => {
  const classes = useStyles();
  const { soloPath, deckPath } = useAppStore((s) => s.settings);
  const loadSolos = useAppStore((s) => s.loadSolos);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    (solo: Solo) =>
      withToast(async () => {
        const { filePath } = await window.electron.createSolo({
          solo,
          path: soloPath,
        });

        if (!filePath) return true; // skip toast
        return await loadSolos();
      }),
    [withToast, loadSolos, soloPath],
  );

  const title = 'Create Solo';

  return (
    <>
      <div className={classes.container}>
        <SoloDetailView
          title={title}
          onSubmit={handleSubmit}
          deckPath={deckPath}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
