import { Toaster, makeStyles, tokens } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { StructureDeck } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { withMessageBox } from '../../utils/withMessageBox';
import { StructureDeckListView } from './StructureDeckListView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalL,
  },
});

export const StructureDeckList = () => {
  const classes = useStyles();
  const { filesPath } = useAppStore((s) => s.settings);
  const structureDecks = useAppStore((s) => s.structureDecks);
  const loadStructureDecks = useAppStore((s) => s.loadStructureDecks);
  const navigate = useNavigate();
  const { toasterId, withToast } = useToast('Success Delete', 'Fail Delete');

  const handleCreate = useCallback(() => navigate('create'), [navigate]);

  const handleEdit = useCallback(
    ({ id }: StructureDeck) => navigate(id.toString()),
    [navigate],
  );

  const handleDelete = useCallback(
    ({ id }: StructureDeck) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.deleteStructureDeck({ filesPath, id });
          await loadStructureDecks();
        }),
      ),
    [withToast, filesPath, loadStructureDecks],
  );

  return (
    <>
      <div className={classes.container}>
        <StructureDeckListView
          structureDecks={structureDecks ?? []}
          onClickCreate={handleCreate}
          onClickEdit={handleEdit}
          onClickDelete={handleDelete}
          onClickReload={loadStructureDecks}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
