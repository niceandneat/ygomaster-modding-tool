import {
  Toaster,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { GateSummary } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { toRelativePath } from '../../utils/toRelativePath';
import { withMessageBox } from '../../utils/withMessageBox';
import { GateListView } from './GateListView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
});

export const GateList = () => {
  const classes = useStyles();
  const { gatePath } = useAppStore((s) => s.settings);
  const gates = useAppStore((s) => s.gates);
  const loadGates = useAppStore((s) => s.loadGates);
  const navigate = useNavigate();
  const { toasterId, withToast } = useToast('Success Delete', 'Fail Delete');

  const handleCreate = useCallback(() => navigate('create'), [navigate]);

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
        <GateListView
          gates={gates ?? []}
          onClickCreate={handleCreate}
          onClickEdit={handleEdit}
          onClickDelete={handleDelete}
          onClickReload={loadGates}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
