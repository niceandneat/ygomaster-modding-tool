import {
  Toaster,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { GateSummary } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { toRelativePath } from '../../utils/toRelativePath';
import { withMessageBox } from '../../utils/withMessageBox';
import { GateListView } from './GateListView';

const useStyles = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  contents: {
    height: '100vh',
    overflowY: 'auto',
    ...shorthands.borderRight('0.5px', 'solid', tokens.colorNeutralStroke1),
  },
});

export const GateList = () => {
  const classes = useStyles();
  const gates = useAppStore((s) => s.gates);
  const loadGates = useAppStore((s) => s.loadGates);
  const { gatePath } = useAppStore((s) => s.settings);
  const navigate = useNavigate();
  const { toasterId, withToast } = useToast('Success Delete', 'Fail Delete');

  const handleCreate = useCallback(() => navigate(''), [navigate]);

  const handleEdit = useCallback(
    (gate: GateSummary) => navigate(toRelativePath(gate.path, gatePath)),
    [navigate, gatePath],
  );

  const handleDelete = useCallback(
    (gate: GateSummary) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.deleteGate({ filePath: gate.path });
          await loadGates();
        }),
      ),
    [withToast, loadGates],
  );

  return (
    <>
      <div className={classes.container}>
        <div className={classes.contents}>
          <GateListView
            gates={gates ?? []}
            onClickCreate={handleCreate}
            onClickEdit={handleEdit}
            onClickDelete={handleDelete}
          />
        </div>
        <Outlet />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
