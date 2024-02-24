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
  const loadSolos = useAppStore((s) => s.loadSolos);
  const { toasterId, withToast } = useToast(
    'Success Data Sync',
    'Fail Data Sync',
  );

  const [loading, setLoading] = useState(false);
  const [dataPath, setDataPath] = useState(settings.dataPath);
  const [gatePath, setGatePath] = useState(settings.gatePath);
  const [soloPath, setSoloPath] = useState(settings.soloPath);
  const [deckPath, setDeckPath] = useState(settings.deckPath);

  return (
    <Card className={classes.card}>
      <CardHeader
        header={<Body1 className={classes.cardTitle}>Data Sync</Body1>}
        description={
          <Caption1>
            Sync between YgoMaster Data and Gate/Solo/Deck files
          </Caption1>
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
        label="Solo Path"
        value={soloPath}
        onChange={setSoloPath}
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
                soloPath,
                deckPath,
                dataPath,
              }),
            );
            await loadGates();
            await loadSolos();
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Data -> Gate/Solo/Deck'}
        </Button>
        <Button
          appearance="primary"
          onClick={async () => {
            setLoading(true);
            await withToast(() =>
              window.electron.exportData({
                gatePath,
                soloPath,
                deckPath,
                dataPath,
              }),
            );
            setLoading(false);
          }}
          disabled={loading}
        >
          {'Gate/Solo/Deck -> Data'}
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
