import {
  Button,
  Dropdown,
  Field,
  Option,
  Title1,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { OpenRegular, SaveRegular } from '@fluentui/react-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Controller,
  FormProvider,
  Path,
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
  language: 'English',
};

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingHorizontalL,
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
  onSubmit: (settings: Settings) => Promise<boolean>;
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
  const { handleSubmit, reset, getValues, formState } = methods;

  const [succeed, setSucceed] = useState(false);
  useWarnNavigation(formState.isDirty);

  const handleSettingsSubmit = useCallback(
    async (settings: Settings) => setSucceed(await onSubmit(settings)),
    [onSubmit],
  );

  // https://react-hook-form.com/docs/useform/reset
  // Avoid calling reset before useForm's useEffect is invoked,
  // this is because useForm's subscription needs to be ready before reset can send a signal to flush form state update.
  useEffect(() => {
    if (!succeed) return;

    reset({ ...defaultSettings, ...getValues() });
    setSucceed(false);
  }, [getValues, reset, succeed]);

  return (
    <div className={classes.container}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleSettingsSubmit)}>
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
          <LanguageInput />
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
          <Field label={name} required>
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

const LanguageInput = () => {
  const classes = useStyles();
  const { control } = useFormContext<Settings>();

  return (
    <div className={classes.space}>
      <Controller
        control={control}
        name="language"
        render={({ field }) => (
          <Field label="asset language" required>
            <Dropdown
              value={field.value}
              selectedOptions={[field.value]}
              onOptionSelect={(_, data) => field.onChange(data.optionValue)}
            >
              {(['English', 'Korean'] as const).map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Dropdown>
          </Field>
        )}
      />
    </div>
  );
};
