import { Toaster, makeStyles, tokens } from '@fluentui/react-components';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { StructureDeck } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { withMessageBox } from '../../utils/withMessageBox';
import { StructureDeckDetailView } from './StructureDeckDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalL,
  },
});

export const StructureDeckDetail = () => {
  const classes = useStyles();
  const { filesPath } = useAppStore((s) => s.settings);
  const { deckPath } = useAppStore((s) => s.paths);
  const structureDecks = useAppStore((s) => s.structureDecks);
  const loadStructureDecks = useAppStore((s) => s.loadStructureDecks);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');
  const { id: idParams } = useParams();
  const id = Number(idParams);

  const [structureDeck, setStructureDeck] = useState<StructureDeck>();

  const handleSubmit = useCallback(
    (structureDeck: StructureDeck) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.updateStructureDeck({
            structureDeck,
            filesPath,
            prevId: id,
          });
          await loadStructureDecks();
        }),
      ),
    [withToast, id, filesPath, loadStructureDecks],
  );

  useEffect(() => {
    const main = async () => {
      const { structureDeck } = await window.electron.readStructureDeck({
        filesPath,
        id,
      });
      setStructureDeck(structureDeck);
    };

    main();
  }, [filesPath, id]);

  if (!structureDeck || !structureDecks) return null;

  return (
    <>
      <div className={classes.container}>
        <StructureDeckDetailView
          title={`Structure Deck ${structureDeck.id}`}
          structureDeck={structureDeck}
          structureDecks={structureDecks}
          deckPath={deckPath}
          onSubmit={handleSubmit}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
