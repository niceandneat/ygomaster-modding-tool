import {
  Button,
  Field,
  Title1,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { OpenRegular, SaveRegular } from '@fluentui/react-icons';
import {
  Controller,
  FormProvider,
  Path,
  SubmitHandler,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { Settings } from '../../../common/type';
import { useWarnNavigation } from '../../hooks/useWarnNavigation';
import { FileInput } from '../input/FileInput';

const defaultSettings: Partial<Settings> = {
  gatePath: '',
  deckPath: '',
  dataPath: '',
};

const useStyles = makeStyles({
  container: {
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    columnGap: tokens.spacingVerticalS,
  },
  title: {
    marginBottom: tokens.spacingVerticalL,
  },
  space: {
    marginBottom: tokens.spacingVerticalM,
  },
});

interface SettingsDetailViewProps {
  settings?: Settings;
  onSubmit: SubmitHandler<Settings>;
  onClickOpenSettingsFile: () => void;
  onClickOpenLogFile: () => void;
}

export const SettingsDetailView = ({
  settings,
  onSubmit,
  onClickOpenSettingsFile,
  onClickOpenLogFile,
}: SettingsDetailViewProps) => {
  const classes = useStyles();
  const methods = useForm<Settings>({
    defaultValues: { ...defaultSettings, ...settings },
  });

  const { isDirty, isSubmitSuccessful } = methods.formState;
  useWarnNavigation(isDirty && !isSubmitSuccessful);

  return (
    <div className={classes.container}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className={classes.header}>
            <Title1 className={classes.title}>Settings</Title1>
            <div className={classes.headerButtons}>
              <Button icon={<OpenRegular />} onClick={onClickOpenLogFile}>
                Open Log File
              </Button>
              <Button icon={<OpenRegular />} onClick={onClickOpenSettingsFile}>
                Open Settings File
              </Button>
              <Button icon={<SaveRegular />} type="submit" appearance="primary">
                Save
              </Button>
            </div>
          </div>
          <FileNameInput name="dataPath" />
          <FileNameInput name="gatePath" />
          <FileNameInput name="deckPath" />
        </form>
      </FormProvider>
    </div>
  );
};

interface FileInputProps {
  name: Path<Settings>;
}

const FileNameInput = ({ name }: FileInputProps) => {
  const classes = useStyles();
  const { control } = useFormContext<Settings>();

  return (
    <div className={classes.space}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Field label={name}>
            <FileInput
              onChange={field.onChange}
              value={field.value?.toString()}
              placeholder="Select a directory"
              directory
            />
          </Field>
        )}
      />
    </div>
  );
};
