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
  shorthands,
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
    ...shorthands.padding(tokens.spacingHorizontalL),
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
  value: string;
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
        value={value}
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
  const [gatePath, setGatePath] = useState(settings.gatePath);
  const [deckPath, setDeckPath] = useState(settings.deckPath);

  return (
    <Card className={classes.card}>
      <CardHeader
        header={<Body1 className={classes.cardTitle}>Data Sync</Body1>}
        description={
          <div className={classes.cardDescription}>
            <Caption1>Sync between YgoMaster Data and Gate/Deck files</Caption1>
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
        label="Gate Path"
        value={gatePath}
        onChange={setGatePath}
      />
      <UtilityDirectoryInput
        label="Deck Path"
        value={deckPath}
        onChange={setDeckPath}
      />
      <Toaster toasterId={toasterId} />
      <CardFooter>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.importData({
                gatePath,
                deckPath,
                dataPath,
              }),
            );
            await loadGates();
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Data -> Gate/Deck'}
        </Button>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.exportData({
                gatePath,
                deckPath,
                dataPath,
              }),
            );
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Gate/Deck -> Data'}
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
  const [deckPath, setDeckPath] = useState(settings.deckPath);

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
        label="Deck Path"
        value={deckPath}
        onChange={setDeckPath}
      />
      <Toaster toasterId={toasterId} />
      <CardFooter>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.importDeck({
                deckPath,
                dataPath,
              }),
            );
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Data -> Deck'}
        </Button>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.exportDeck({
                deckPath,
                dataPath,
              }),
            );
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Deck -> Data'}
        </Button>
      </CardFooter>
    </Card>
  );
};
