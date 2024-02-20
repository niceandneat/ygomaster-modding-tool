import {
  Toaster,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { SoloSummary } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { toRelativePath } from '../../utils/toRelativePath';
import { withMessageBox } from '../../utils/withMessageBox';
import { SoloListView } from './SoloListView';

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

export const SoloList = () => {
  const classes = useStyles();
  const solos = useAppStore((s) => s.solos);
  const loadSolos = useAppStore((s) => s.loadSolos);
  const { soloPath } = useAppStore((s) => s.settings);
  const navigate = useNavigate();
  const { toasterId, withToast } = useToast('Success Delete', 'Fail Delete');

  const handleCreate = useCallback(() => navigate(''), [navigate]);

  const handleEdit = useCallback(
    (solo: SoloSummary) => navigate(toRelativePath(solo.path, soloPath)),
    [navigate, soloPath],
  );

  const handleDelete = useCallback(
    (solo: SoloSummary) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.deleteSolo({ filePath: solo.path });
          await loadSolos();
        }),
      ),
    [withToast, loadSolos],
  );

  return (
    <>
      <div className={classes.container}>
        <div className={classes.contents}>
          <SoloListView
            solos={solos ?? []}
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
