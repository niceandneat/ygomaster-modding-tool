import { Toaster, makeStyles, tokens } from '@fluentui/react-components';
import { useCallback, useEffect, useState } from 'react';

import { Gate, GateSummary } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { getChapterName } from '../../utils/getChapterName';
import { GateDetailView } from './GateDetailView';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalL,
  },
});

export const GateCreate = () => {
  const classes = useStyles();
  const { gatePath } = useAppStore((s) => s.settings);
  const loadGates = useAppStore((s) => s.loadGates);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const [gates, setGates] = useState<GateSummary[]>();

  const handleSubmit = useCallback(
    (gate: Gate) =>
      withToast(async () => {
        const { filePath } = await window.electron.createGate({
          gate,
          path: gatePath,
        });

        if (!filePath) return true; // skip toast
        return await loadGates();
      }),
    [withToast, loadGates, gatePath],
  );

  const handleLoadChapters = useCallback(
    async (gateId: number) => {
      const gateSummary = gates?.find(({ id }) => id === gateId);
      if (!gateSummary) return [];

      const { gate } = await window.electron.readGate({
        filePath: gateSummary.path,
      });
      return gate.chapters.map((chapter) => ({
        id: chapter.id,
        name: getChapterName(chapter),
      }));
    },
    [gates],
  );

  useEffect(() => {
    const main = async () => {
      const { gates } = await window.electron.readGates({ gatePath });
      setGates(gates);
    };
    main();
  }, [gatePath]);

  const title = 'Create Gate';

  if (!gates) return null;

  return (
    <>
      <div className={classes.container}>
        <GateDetailView
          title={title}
          gates={gates}
          loadChapters={handleLoadChapters}
          onSubmit={handleSubmit}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
