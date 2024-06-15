import { Toaster, makeStyles, tokens } from '@fluentui/react-components';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Gate } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { getChapterName } from '../../utils/getChapterName';
import { withMessageBox } from '../../utils/withMessageBox';
import { GateDetailView } from './GateDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalL,
  },
});

export const GateDetail = () => {
  const classes = useStyles();
  const { filesPath } = useAppStore((s) => s.settings);
  const gates = useAppStore((s) => s.gates);
  const loadGates = useAppStore((s) => s.loadGates);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');
  const { id: idParams } = useParams();
  const id = Number(idParams);

  const [gate, setGate] = useState<Gate>();

  const handleSubmit = useCallback(
    (gate: Gate) =>
      withToast(() =>
        withMessageBox(async () => {
          await window.electron.updateGate({ gate, filesPath, prevId: id });
          await loadGates();
        }),
      ),
    [withToast, id, filesPath, loadGates],
  );

  const handleLoadChapters = useCallback(
    async (gateId: number) => {
      const gateSummary = gates?.find(({ id }) => id === gateId);
      if (!gateSummary) return [];

      const { gate } = await window.electron.readGate({
        filesPath,
        id: gateId,
      });

      return gate.chapters.map((chapter) => ({
        id: chapter.id,
        name: getChapterName(chapter),
      }));
    },
    [filesPath, gates],
  );

  useEffect(() => {
    const main = async () => {
      const { gate } = await window.electron.readGate({ filesPath, id });
      setGate(gate);
    };

    main();
  }, [filesPath, id]);

  if (!gate || !gates) return null;

  return (
    <>
      <div className={classes.container}>
        <GateDetailView
          title={`Gate ${gate.id}`}
          gate={gate}
          gates={gates}
          loadChapters={handleLoadChapters}
          onSubmit={handleSubmit}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
