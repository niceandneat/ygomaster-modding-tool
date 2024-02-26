import {
  Toaster,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Gate } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { toAbsolutePath } from '../../utils/toAbsolutePath';
import { withMessageBox } from '../../utils/withMessageBox';
import { GateDetailView } from './GateDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
});

export const GateDetail = () => {
  const classes = useStyles();
  const activeGate = useAppStore((s) => s.activeGate);
  const loadActiveGate = useAppStore((s) => s.loadActiveGate);
  const loadGates = useAppStore((s) => s.loadGates);
  const { gatePath } = useAppStore((s) => s.settings);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');
  const params = useParams();

  const fileName = params['*'] || 'UNKNOWN_PATH';
  const filePath = toAbsolutePath(fileName, gatePath);

  const handleSubmit = useCallback(
    (gate: Gate) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.updateGate({ gate, filePath });
          await loadGates();
        }),
      ),
    [withToast, filePath, loadGates],
  );

  useEffect(() => {
    loadActiveGate(filePath);
  }, [loadActiveGate, filePath]);

  if (!activeGate) return null;

  return (
    <>
      <div className={classes.container}>
        <GateDetailView
          title={fileName}
          gate={activeGate}
          onSubmit={handleSubmit}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
