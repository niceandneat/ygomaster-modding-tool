import {
  Body1,
  Button,
  Caption1,
  Card,
  CardFooter,
  CardHeader,
  Field,
  Title1,
  Toaster,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useState } from 'react';

import { useToast } from '../../hooks/useToast';
import { useAppStore } from '../../store';
import { FileInput } from '../input/FileInput';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    overflowY: 'auto',
    padding: tokens.spacingHorizontalL,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    marginBottom: tokens.spacingVerticalL,
  },
  card: {
    marginBottom: tokens.spacingVerticalL,
  },
  cardTitle: {
    fontWeight: 700,
  },
  cardDescription: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export const Utilities = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Title1 className={classes.title}>Utilities</Title1>
      </div>
      <DataSyncUtility />
      <DeckSyncUtility />
    </div>
  );
};

interface UtilityDirectoryInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

const UtilityDirectoryInput = ({
  label,
  value,
  onChange,
}: UtilityDirectoryInputProps) => {
  return (
    <Field label={label}>
      <FileInput
        value={value || ''}
        onChange={onChange}
        placeholder="Select a directory"
        directory
      />
    </Field>
  );
};

const DataSyncUtility = () => {
  const classes = useStyles();
  const settings = useAppStore((s) => s.settings);
  const loadGates = useAppStore((s) => s.loadGates);
  const { toasterId, withToast } = useToast(
    'Success Data Sync',
    'Fail Data Sync',
  );

  const [loading, setLoading] = useState(false);
  const [dataPath, setDataPath] = useState(settings.dataPath);
  const [filesPath, setFilesPath] = useState(settings.filesPath);

  return (
    <Card className={classes.card}>
      <CardHeader
        header={<Body1 className={classes.cardTitle}>Data Sync</Body1>}
        description={
          <div className={classes.cardDescription}>
            <Caption1>Sync between YgoMaster Data and Tool files</Caption1>
            <Caption1>
              {
                'When creating data from files, the IDs of the chapters in the gate file are combined with the ID of the gate. (e.g. { chapterId: 1, gateId: 1 } => { chapterId: 10001 })'
              }
            </Caption1>
            <Caption1>
              {
                'When creating files from data, the same rule applies but in reverse. (e.g. { chapterId: 10001 } => { chapterId: 1, gateId: 1 })'
              }
            </Caption1>
          </div>
        }
      />
      <UtilityDirectoryInput
        label="Data Path"
        value={dataPath}
        onChange={setDataPath}
      />
      <UtilityDirectoryInput
        label="Files Path"
        value={filesPath}
        onChange={setFilesPath}
      />
      <Toaster toasterId={toasterId} />
      <CardFooter>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.importData({
                filesPath,
                dataPath,
              }),
            );
            await loadGates();
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Import (Data -> Files)'}
        </Button>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.exportData({
                filesPath,
                dataPath,
              }),
            );
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Export (Files -> Data)'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const DeckSyncUtility = () => {
  const classes = useStyles();
  const settings = useAppStore((s) => s.settings);
  const { toasterId, withToast } = useToast(
    'Success Deck Sync',
    'Fail Deck Sync',
  );

  const [loading, setLoading] = useState(false);
  const [dataPath, setDataPath] = useState(settings.dataPath);
  const [filesPath, setFilesPath] = useState(settings.filesPath);

  return (
    <Card className={classes.card}>
      <CardHeader
        header={<Body1 className={classes.cardTitle}>Deck Sync</Body1>}
        description={
          <Caption1>Sync between YgoMaster Data and Deck files</Caption1>
        }
      />
      <UtilityDirectoryInput
        label="Data Path"
        value={dataPath}
        onChange={setDataPath}
      />
      <UtilityDirectoryInput
        label="Files Path"
        value={filesPath}
        onChange={setFilesPath}
      />
      <Toaster toasterId={toasterId} />
      <CardFooter>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.importDeck({
                filesPath,
                dataPath,
              }),
            );
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Import (Data -> Deck)'}
        </Button>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.exportDeck({
                filesPath,
                dataPath,
              }),
            );
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Export (Deck -> Data)'}
        </Button>
      </CardFooter>
    </Card>
  );
};
