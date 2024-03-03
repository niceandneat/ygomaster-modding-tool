import {
  Toaster,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { DuelChapter, Gate, GateChapter } from '../../../common/type';
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

const makeValidChaters = (gate: Gate): Gate => ({
  ...gate,
  chapters: gate.chapters.map((chapter) => {
    if (chapter.type === 'Gate') {
      return {
        id: chapter.id,
        parent_id: chapter.parent_id,
        description: chapter.description,
        type: chapter.type,
        unlock: chapter.unlock,
      } satisfies GateChapter;
    }

    // if chapter.type === 'Duel'
    return {
      id: chapter.id,
      parent_id: chapter.parent_id,
      description: chapter.description,
      type: chapter.type,
      cpu_deck: chapter.cpu_deck,
      rental_deck: chapter.rental_deck,
      mydeck_reward: chapter.mydeck_reward,
      rental_reward: chapter.rental_reward,
      cpu_hand: chapter.cpu_hand,
      player_hand: chapter.player_hand,
      cpu_name: chapter.cpu_name,
      cpu_flag: chapter.cpu_flag,
      cpu_value: chapter.cpu_value,
    } satisfies DuelChapter;
  }),
});

export const GateDetail = () => {
  const classes = useStyles();
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
          await window.electron.updateGate({
            gate: makeValidChaters(gate),
            filePath,
          });
          await loadGates();
        }),
      ),
    [withToast, filePath, loadGates],
  );

  const [gate, setGate] = useState<Gate>();
  useEffect(() => {
    const main = async () => {
      const { gate } = await window.electron.readGate({ filePath });
      setGate(gate);
    };

    main();
  }, [filePath]);

  if (!gate) return null;

  return (
    <>
      <div className={classes.container}>
        <GateDetailView title={fileName} gate={gate} onSubmit={handleSubmit} />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
