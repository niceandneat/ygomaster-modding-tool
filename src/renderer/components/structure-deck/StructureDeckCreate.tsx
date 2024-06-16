import { Toaster, makeStyles, tokens } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { StructureDeck } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { StructureDeckDetailView } from './StructureDeckDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalL,
  },
});

export const StructureDeckCreate = () => {
  const classes = useStyles();
  const { filesPath } = useAppStore((s) => s.settings);
  const { deckPath } = useAppStore((s) => s.paths);
  const structureDecks = useAppStore((s) => s.structureDecks);
  const loadStructureDecks = useAppStore((s) => s.loadStructureDecks);
  const navigate = useNavigate();
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    (structureDeck: StructureDeck) =>
      withToast(async () => {
        await window.electron.createStructureDeck({ structureDeck, filesPath });

        // Exit page after useWarnNavigation check passed
        loadStructureDecks().then(() => navigate('/structure-decks'));
      }),
    [withToast, filesPath, loadStructureDecks, navigate],
  );
  if (!structureDecks) return null;

  return (
    <>
      <div className={classes.container}>
        <StructureDeckDetailView
          title={'Create StructureDeck'}
          structureDecks={structureDecks}
          deckPath={deckPath}
          onSubmit={handleSubmit}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
