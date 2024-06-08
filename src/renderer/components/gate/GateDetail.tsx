import { Toaster, makeStyles, tokens } from '@fluentui/react-components';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Gate, GateSummary } from '../../../common/type';
import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { getChapterName } from '../../utils/getChapterName';
import { toAbsolutePath } from '../../utils/toAbsolutePath';
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
  const loadGates = useAppStore((s) => s.loadGates);
  const { gatePath } = useAppStore((s) => s.settings);
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');
  const params = useParams();

  const [gate, setGate] = useState<Gate>();
  const [gates, setGates] = useState<GateSummary[]>();

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
      const [{ gate }, { gates }] = await Promise.all([
        window.electron.readGate({ filePath }),
        window.electron.readGates({ gatePath }),
      ]);

      setGate(gate);
      setGates(gates);
    };

    main();
  }, [filePath, gatePath]);

  if (!gate || !gates) return null;

  return (
    <>
      <div className={classes.container}>
        <GateDetailView
          title={fileName}
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
