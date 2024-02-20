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
import { ReactNode, useState } from 'react';

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
      <ImportUtility />
      <ExportUtility />
    </div>
  );
};

interface UtilityItemProps {
  title: string;
  description: string;
  buttonText: string;
  loading?: boolean;
  onClick: () => void;
  children?: ReactNode;
}

const UtilityItem = ({
  title,
  description,
  buttonText,
  loading,
  onClick,
  children,
}: UtilityItemProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader
        header={<Body1 className={classes.cardTitle}>{title}</Body1>}
        description={<Caption1>{description}</Caption1>}
      />
      {children}
      <CardFooter>
        <Button appearance="primary" onClick={onClick} disabled={loading}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface UtilityFileInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const UtilityFileInput = ({
  label,
  value,
  onChange,
}: UtilityFileInputProps) => {
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

const ImportUtility = () => {
  const settings = useAppStore((s) => s.settings);
  const { toasterId, withToast } = useToast('Success Import', 'Fail Import');

  const [loading, setLoading] = useState(false);
  const [dataPath, setDataPath] = useState(settings.dataPath);
  const [gatePath, setGatePath] = useState(settings.gatePath);
  const [soloPath, setSoloPath] = useState(settings.soloPath);
  const [deckPath, setDeckPath] = useState(settings.deckPath);

  return (
    <UtilityItem
      title="Data to Files"
      description="Import gate & solo files from YgoMaster data"
      buttonText="Import"
      loading={loading}
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
        setLoading(false);
      }}
    >
      <UtilityFileInput
        label="Data Path"
        value={dataPath}
        onChange={setDataPath}
      />
      <UtilityFileInput
        label="Gate Path"
        value={gatePath}
        onChange={setGatePath}
      />
      <UtilityFileInput
        label="Solo Path"
        value={soloPath}
        onChange={setSoloPath}
      />
      <UtilityFileInput
        label="Deck Path"
        value={deckPath}
        onChange={setDeckPath}
      />
      <Toaster toasterId={toasterId} />
    </UtilityItem>
  );
};

const ExportUtility = () => {
  const settings = useAppStore((s) => s.settings);
  const { toasterId, withToast } = useToast('Success Export', 'Fail Export');

  const [loading, setLoading] = useState(false);
  const [dataPath, setDataPath] = useState(settings.dataPath);
  const [gatePath, setGatePath] = useState(settings.gatePath);
  const [soloPath, setSoloPath] = useState(settings.soloPath);
  const [deckPath, setDeckPath] = useState(settings.deckPath);

  return (
    <UtilityItem
      title="Files to Data"
      description="Export gate & solo files to YgoMaster data"
      buttonText="Export"
      loading={loading}
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
    >
      <UtilityFileInput
        label="Data Path"
        value={dataPath}
        onChange={setDataPath}
      />
      <UtilityFileInput
        label="Gate Path"
        value={gatePath}
        onChange={setGatePath}
      />
      <UtilityFileInput
        label="Solo Path"
        value={soloPath}
        onChange={setSoloPath}
      />
      <UtilityFileInput
        label="Deck Path"
        value={deckPath}
        onChange={setDeckPath}
      />
      <Toaster toasterId={toasterId} />
    </UtilityItem>
  );
};
