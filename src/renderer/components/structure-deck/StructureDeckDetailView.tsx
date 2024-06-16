import {
  Button,
  Field,
  Title1,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { SaveRegular } from '@fluentui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { ItemCategory, StructureDeck } from '../../../common/type';
import { useWarnNavigation } from '../../hooks/useWarnNavigation';
import { FileInput } from '../input/FileInput';
import { ItemIdInput } from '../input/ItemIdInput';
import { PlainInput } from '../input/PlainInput';

const defaultStructureDeck: StructureDeck = {
  id: 0,
  name: '',
  description: '',
  deck: '',
  focus: [0, 0, 0],
  box: 0,
  sleeve: 0,
};

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalL,
    marginBottom: '64px',
  },
  split: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
    '& > *': {
      flexGrow: '1',
    },
  },
  title: {
    marginBottom: tokens.spacingVerticalL,
  },
});

interface StructureDeckDetailViewProps {
  title?: string;
  structureDeck?: StructureDeck;
  structureDecks: StructureDeck[];
  deckPath?: string;
  onSubmit: (settings: StructureDeck) => Promise<boolean>;
}

export const StructureDeckDetailView = ({
  title,
  structureDeck,
  structureDecks,
  deckPath,
  onSubmit,
}: StructureDeckDetailViewProps) => {
  const classes = useStyles();

  const defaultValuesForCreation = useMemo(() => {
    // STdecks ID should start from 1120001 and some of ids are pre-occupied by system STdecks.
    // We use IDs started from 1121001 for safety.
    const id = Math.max(...structureDecks.map(({ id }) => id), 1121000) + 1;

    return { ...defaultStructureDeck, id };
  }, [structureDecks]);
  const methods = useForm<StructureDeck>({
    defaultValues: { ...defaultValuesForCreation, ...structureDeck },
  });
  const { handleSubmit, reset, getValues, formState } = methods;

  const [succeed, setSucceed] = useState(false);
  useWarnNavigation(formState.isDirty);

  const handleGateSubmit = useCallback(
    async (structureDeck: StructureDeck) => {
      const succeed = await onSubmit(structureDeck);
      setSucceed(succeed);
    },
    [onSubmit],
  );

  // https://react-hook-form.com/docs/useform/reset
  // Avoid calling reset before useForm's useEffect is invoked,
  // this is because useForm's subscription needs to be ready before reset can send a signal to flush form state update.
  useEffect(() => {
    if (!succeed) return;

    reset({ ...defaultStructureDeck, ...getValues() });
    setSucceed(false);
  }, [getValues, reset, succeed]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleGateSubmit)}>
        <div className={classes.header}>
          <Title1 className={classes.title}>{title || 'Structure Deck'}</Title1>
          <Button icon={<SaveRegular />} type="submit" appearance="primary">
            Save
          </Button>
        </div>
        <div className={classes.stack}>
          <PlainInput<StructureDeck, 'id'>
            name="id"
            number
            integer
            rules={{
              min: {
                value: 1121001,
                message: 'id should be larger than 1121000',
              },
              validate: {
                unique: (inputId: number) =>
                  structureDecks.every(({ id }) => id !== inputId) ||
                  'id should be unique',
              },
            }}
          />
          <PlainInput<StructureDeck> name="name" />
          <PlainInput<StructureDeck> name="description" multiline />
          <DeckInput path={deckPath} />
          <AccessoryInput />
        </div>
      </form>
    </FormProvider>
  );
};

interface DeckInputProps {
  path?: string;
}

const DeckInput = ({ path }: DeckInputProps) => {
  const { control, formState } = useFormContext<StructureDeck>();

  const error = formState.errors.deck;

  return (
    <Controller
      control={control}
      name="deck"
      rules={{ required: 'This field is required' }}
      render={({ field }) => (
        <Field label="deck" required validationMessage={error?.message}>
          <FileInput
            onChange={(filePath) => {
              const fileName = filePath.split('\\').pop()?.split('/').pop();
              field.onChange(fileName);
            }}
            value={field.value?.toString()}
            path={path}
            placeholder="Select deck file"
          />
        </Field>
      )}
    />
  );
};

const AccessoryInput = () => {
  const classes = useStyles();
  const { control } = useFormContext<StructureDeck>();

  return (
    <div className={classes.split}>
      <Controller
        control={control}
        name="box"
        render={({ field }) => (
          <ItemIdInput
            required
            includeNone
            label="box"
            category={ItemCategory.DECK_CASE}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="sleeve"
        render={({ field }) => (
          <ItemIdInput
            required
            includeNone
            label="sleeve"
            category={ItemCategory.PROTECTOR}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
};
