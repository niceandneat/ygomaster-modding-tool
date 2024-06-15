import { Toaster, makeStyles, tokens } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Gate } from '../../../common/type';
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
  const { filesPath } = useAppStore((s) => s.settings);
  const gates = useAppStore((s) => s.gates);
  const loadGates = useAppStore((s) => s.loadGates);
  const navigate = useNavigate();
  const { toasterId, withToast } = useToast('Success Save', 'Fail Save');

  const handleSubmit = useCallback(
    (gate: Gate) =>
      withToast(async () => {
        await window.electron.createGate({ gate, filesPath });

        // Exit page after useWarnNavigation check passed
        loadGates().then(() => navigate('/gates'));
      }),
    [withToast, filesPath, loadGates, navigate],
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

  if (!gates) return null;

  return (
    <>
      <div className={classes.container}>
        <GateDetailView
          title="Create Gate"
          gates={gates}
          loadChapters={handleLoadChapters}
          onSubmit={handleSubmit}
        />
      </div>
      <Toaster toasterId={toasterId} />
    </>
  );
};
