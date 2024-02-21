import { Toaster, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';

import { Gate } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { GateDetailView } from './GateDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
  },
});

export const GateCreate = () => {
  const classes = useStyles();
  const { gatePath } = useAppStore((s) => s.settings);
  const loadGates = useAppStore((s) => s.loadGates);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    (gate: Gate) =>
      withToast(async () => {
        const { filePath } = await window.electron.createGate({
          gate,
          path: gatePath,
        });

        if (!filePath) return true; // skip toast
        return await loadGates();
      }),
    [withToast, loadGates, gatePath],
  );

  const title = 'Create Gate';

  return (
    <>
      <div className={classes.container}>
        <GateDetailView title={title} onSubmit={handleSubmit} />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
