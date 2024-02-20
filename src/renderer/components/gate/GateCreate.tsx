import { Toaster, makeStyles } from '@fluentui/react-components';
import { useCallback } from 'react';

import { Gate } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { withMessageBox } from '../../utils/withMessageBox';
import { GateDetailView } from './GateDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
  },
});

export const GateCreate = () => {
  const classes = useStyles();
  const loadGates = useAppStore((s) => s.loadGates);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    (gate: Gate) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.createGate({ gate });
          await loadGates();
        }),
      ),
    [withToast, loadGates],
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
