import {
  Button,
  Card,
  Combobox,
  Dropdown,
  Field,
  Option,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add16Regular, Subtract16Regular } from '@fluentui/react-icons';
import { useEffect } from 'react';
import {
  Controller,
  FieldArrayPath,
  FormProvider,
  Path,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import {
  Chapter,
  ChapterType,
  DuelChapter,
  GateChapter,
  ItemCategory,
} from '../../../common/type';
import { FileInput } from '../input/FileInput';
import { PlainInput } from '../input/PlainInput';

const defaultDuelChapter: Partial<DuelChapter> = {
  id: 0,
  parent_id: 0,
  description: '',
  type: 'Duel',
  cpu_deck: '',
  rental_deck: '',
  mydeck_reward: [],
  rental_reward: [],
  cpu_hand: 6,
  player_hand: 5,
  cpu_name: 'CPU',
  cpu_flag: 'None',
  cpu_value: 98,
};

const defaultGateChapter: Partial<GateChapter> = {
  id: 0,
  parent_id: 0,
  description: '',
  type: 'Gate',
  unlock: [],
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
  },
  title: {
    marginBottom: tokens.spacingVerticalL,
  },
  label: {
    display: 'block',
    marginBottom: tokens.spacingVerticalS,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: tokens.spacingVerticalM,
  },
});

interface ChapterDetailViewProps {
  chapter?: Chapter;
  deckPath?: string;
  onChange?: (chapter: Chapter) => void;
}

export const ChapterDetailView = ({
  chapter,
  deckPath,
  onChange,
}: ChapterDetailViewProps) => {
  const classes = useStyles();

  const methods = useForm<Chapter>({
    defaultValues: { ...defaultGateChapter, ...defaultDuelChapter, ...chapter },
  });
  const { watch, control, trigger } = methods;

  useEffect(() => {
    const subscription = watch((value) => {
      onChange?.(value as Chapter);
    });
    return () => subscription.unsubscribe();
  }, [onChange, watch]);

  useEffect(() => {
    trigger();
  }, [trigger]);

  const type = watch('type');

  return (
    <FormProvider {...methods}>
      <div className={classes.stack}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Field label="type" required>
              <Dropdown
                value={field.value}
                selectedOptions={[field.value]}
                onOptionSelect={(_, data) => {
                  field.onChange(data.optionValue as ChapterType);
                }}
              >
                <Option value="Duel">Duel</Option>
                <Option value="Gate">Gate</Option>
              </Dropdown>
            </Field>
          )}
        />
        <PlainInput<Chapter> name="id" number />
        <PlainInput<Chapter> name="description" multiline />
        {type === 'Duel' && (
          <>
            <FileNameInput name="cpu_deck" path={deckPath} />
            <FileNameInput name="rental_deck" path={deckPath} optional />
            <MydeckRewardInput />
            <RentalRewardInput />
            <PlainInput<Chapter> name="cpu_hand" number />
            <PlainInput<Chapter> name="player_hand" number />
            <PlainInput<Chapter> name="cpu_flag" />
            <PlainInput<Chapter> name="cpu_name" />
            <PlainInput<Chapter> name="cpu_value" number />
          </>
        )}
        {type === 'Gate' && <UnlockInput />}
      </div>
    </FormProvider>
  );
};

interface FileInputProps {
  name: Extract<Path<DuelChapter>, 'cpu_deck' | 'rental_deck'>;
  path?: string;
  optional?: boolean;
}
const getFileName = (path: string) => path.split('\\').pop()?.split('/').pop();

const FileNameInput = ({ name, path, optional }: FileInputProps) => {
  const { control, formState } = useFormContext<DuelChapter>();

  const label = name.replaceAll('_', ' ');
  const error = formState.errors[name]?.message;

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: !optional && 'This field is required' }}
      render={({ field }) => (
        <Field
          label={label}
          required={!optional}
          validationMessage={error?.toString()}
        >
          <FileInput
            onChange={(filePath) => field.onChange(getFileName(filePath))}
            value={field.value?.toString()}
            path={path}
            placeholder="Select deck file"
          />
        </Field>
      )}
    />
  );
};

interface ItemInputProps {
  name: FieldArrayPath<Chapter>;
  disabled?: boolean;
}

const categoryOptions = Object.entries(ItemCategory).map(([label, value]) => ({
  label,
  value,
}));

const ItemInput = ({ name, disabled }: ItemInputProps) => {
  const classes = useStyles();
  const { control } = useFormContext<Chapter>();
  const { fields, append, remove } = useFieldArray<Chapter>({ name });

  const label = name.replaceAll('_', ' ');

  return (
    <div>
      <Text className={classes.label}>{label}</Text>
      {fields.map((item, index) => (
        <Card key={item.id} className={classes.card}>
          <Controller
            control={control}
            name={`${name}.${index}.category`}
            render={({ field }) => (
              <Field label="category" required>
                <Combobox
                  placeholder="Select a category"
                  value={field.value}
                  selectedOptions={[field.value]}
                  onInput={field.onChange}
                  onOptionSelect={(_, { optionValue }) =>
                    field.onChange(optionValue)
                  }
                >
                  {categoryOptions.map(({ label, value }) => (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ))}
                </Combobox>
              </Field>
            )}
          />
          <PlainInput label="id" name={`${name}.${index}.id`} />
          <PlainInput label="counts" name={`${name}.${index}.counts`} number />
          <Tooltip content="Remove reward item" relationship="label">
            <Button
              icon={<Subtract16Regular />}
              onClick={() => remove(index)}
            />
          </Tooltip>
        </Card>
      ))}
      <Button
        icon={<Add16Regular />}
        disabled={disabled}
        onClick={() =>
          append({ category: ItemCategory.CONSUME, id: '1', counts: 100 })
        }
      >
        Add Item
      </Button>
    </div>
  );
};

const MydeckRewardInput = () => {
  return <ItemInput name="mydeck_reward" />;
};

const RentalRewardInput = () => {
  const { control } = useFormContext<Chapter>();
  const rentalDeck = useWatch({ control, name: 'rental_deck' });

  return <ItemInput name="rental_reward" disabled={Boolean(!rentalDeck)} />;
};

const UnlockInput = () => {
  return <ItemInput name="unlock" />;
};
