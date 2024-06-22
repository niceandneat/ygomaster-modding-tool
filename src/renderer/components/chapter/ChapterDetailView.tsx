import {
  Button,
  Card,
  Dropdown,
  Field,
  Option,
  Rating,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add16Regular,
  ArrowShuffle16Regular,
  StarOffRegular,
  Subtract16Regular,
} from '@fluentui/react-icons';
import { useCallback, useEffect, useRef } from 'react';
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
  ItemCategory,
  defaultDuelChapter,
  defaultRewardChapter,
  defaultUnlockChapter,
} from '../../../common/type';
import { dataStore } from '../../data';
import { debounce } from '../../utils/debounce';
import { CardPackInput } from '../input/CardPackInput';
import { FileInput } from '../input/FileInput';
import { ItemIdInput } from '../input/ItemIdInput';
import { ItemInput } from '../input/ItemInput';
import { PlainInput } from '../input/PlainInput';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    marginBottom: '128px',
  },
  split: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    '& > *': {
      flexGrow: '1',
    },
  },
  title: {
    marginBottom: tokens.spacingVerticalL,
  },
  difficultyContainer: {
    display: 'flex',
    justifyItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
});

const useListStyles = makeStyles({
  label: {
    display: 'block',
    marginBottom: tokens.spacingVerticalS,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: tokens.spacingVerticalM,
    overflow: 'visible',
  },
  fullWidth: {
    flex: '1',
  },
});

const getRandomItem = (items?: { id: number }[]) =>
  items ? Number(items[Math.floor(items.length * Math.random())].id) : 0;

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
    defaultValues: {
      ...defaultUnlockChapter,
      ...defaultRewardChapter,
      ...defaultDuelChapter,
      ...chapter,
    },
  });
  const { watch, control, trigger, setValue } = methods;

  const randomizeAccessories = useCallback(() => {
    const field = getRandomItem(dataStore.getItems(ItemCategory.FIELD));

    setValue('player_mat', field);
    setValue('cpu_mat', field);
    setValue('player_duel_object', field + 10000);
    setValue('cpu_duel_object', field + 10000);
    setValue('player_avatar_home', field + 20000);
    setValue('cpu_avatar_home', field + 20000);
    setValue(
      'player_sleeve',
      getRandomItem(dataStore.getItems(ItemCategory.PROTECTOR)),
    );
    setValue(
      'cpu_sleeve',
      getRandomItem(dataStore.getItems(ItemCategory.PROTECTOR)),
    );
    setValue(
      'player_icon',
      getRandomItem(dataStore.getItems(ItemCategory.ICON)),
    );
    setValue('cpu_icon', getRandomItem(dataStore.getItems(ItemCategory.ICON)));
    setValue(
      'player_icon_frame',
      getRandomItem(dataStore.getItems(ItemCategory.ICON_FRAME)),
    );
    setValue(
      'cpu_icon_frame',
      getRandomItem(dataStore.getItems(ItemCategory.ICON_FRAME)),
    );
    setValue(
      'player_avatar',
      getRandomItem(dataStore.getItems(ItemCategory.AVATAR)),
    );
    setValue(
      'cpu_avatar',
      getRandomItem(dataStore.getItems(ItemCategory.AVATAR)),
    );
  }, [setValue]);

  useEffect(() => {
    if (!onChange) return;

    const validate = debounce(() => trigger(), 100);
    const subscription = watch((value) => {
      onChange(value as Chapter);
      validate();
    });

    return () => subscription.unsubscribe();
  }, [onChange, trigger, watch]);

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
                {(['Duel', 'Unlock', 'Reward'] as ChapterType[]).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          )}
        />
        <PlainInput<Chapter> name="description" multiline />
        <UnlockPackInput />
        {type === 'Duel' && (
          <>
            <DifficultyInput />
            <FileNameInput
              name="cpu_deck"
              path={deckPath}
              onChange={(fileName) => {
                const cpuName = fileName?.replace(/\.json$/, '') ?? '';
                setValue('cpu_name', cpuName);
              }}
            />
            <FileNameInput name="rental_deck" path={deckPath} optional />
            <MydeckRewardInput />
            <RentalRewardInput />
            <PlainInput<Chapter> name="cpu_name" />
            <div className={classes.split}>
              <PlainInput<Chapter> name="cpu_flag" />
              <PlainInput<Chapter> name="cpu_value" number integer />
            </div>
            <div className={classes.split}>
              <PlainInput<Chapter> name="player_hand" number integer />
              <PlainInput<Chapter> name="cpu_hand" number integer />
            </div>
            <div className={classes.split}>
              <PlainInput<Chapter> name="player_life" number integer />
              <PlainInput<Chapter> name="cpu_life" number integer />
            </div>
            <div className={classes.split}>
              <AccessoryInput name="player_mat" category={ItemCategory.FIELD} />
              <AccessoryInput name="cpu_mat" category={ItemCategory.FIELD} />
            </div>
            <div className={classes.split}>
              <AccessoryInput
                name="player_sleeve"
                category={ItemCategory.PROTECTOR}
              />
              <AccessoryInput
                name="cpu_sleeve"
                category={ItemCategory.PROTECTOR}
              />
            </div>
            <div className={classes.split}>
              <AccessoryInput name="player_icon" category={ItemCategory.ICON} />
              <AccessoryInput name="cpu_icon" category={ItemCategory.ICON} />
            </div>
            <div className={classes.split}>
              <AccessoryInput
                name="player_icon_frame"
                category={ItemCategory.ICON_FRAME}
              />
              <AccessoryInput
                name="cpu_icon_frame"
                category={ItemCategory.ICON_FRAME}
              />
            </div>
            <div className={classes.split}>
              <AccessoryInput
                name="player_avatar"
                category={ItemCategory.AVATAR}
              />
              <AccessoryInput
                name="cpu_avatar"
                category={ItemCategory.AVATAR}
              />
            </div>
            <div className={classes.split}>
              <AccessoryInput
                name="player_avatar_home"
                category={ItemCategory.AVATAR_HOME}
              />
              <AccessoryInput
                name="cpu_avatar_home"
                category={ItemCategory.AVATAR_HOME}
              />
            </div>
            <div className={classes.split}>
              <AccessoryInput
                name="player_duel_object"
                category={ItemCategory.FIELD_OBJ}
              />
              <AccessoryInput
                name="cpu_duel_object"
                category={ItemCategory.FIELD_OBJ}
              />
            </div>
            <Button
              icon={<ArrowShuffle16Regular />}
              onClick={randomizeAccessories}
            >
              Randomize accessories
            </Button>
          </>
        )}
        {type === 'Unlock' && <UnlockInput />}
        {type === 'Reward' && <RewardInput />}
      </div>
    </FormProvider>
  );
};

interface FileInputProps {
  name: Extract<Path<DuelChapter>, 'cpu_deck' | 'rental_deck'>;
  path?: string;
  optional?: boolean;
  onChange?: (fileName?: string) => void;
}

const FileNameInput = ({ name, path, optional, onChange }: FileInputProps) => {
  const { control, formState } = useFormContext<DuelChapter>();

  const label = name.replaceAll('_', ' ');
  const error = formState.errors[name];

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: !optional && 'This field is required' }}
      render={({ field }) => (
        <Field
          label={label}
          required={!optional}
          validationMessage={error?.message}
        >
          <FileInput
            onChange={(filePath) => {
              const fileName = filePath.split('\\').pop()?.split('/').pop();
              field.onChange(fileName);
              onChange?.(fileName);
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

interface ItemInputProps {
  name: FieldArrayPath<Chapter>;
  categories?: ItemCategory[];
  disabled?: boolean;
}

const ItemListInput = ({ name, categories, disabled }: ItemInputProps) => {
  const classes = useListStyles();
  const { control } = useFormContext<Chapter>();
  const { fields, append, remove } = useFieldArray<Chapter>({ name });
  const inputRef = useRef<HTMLDivElement>(null);

  const label = name.replaceAll('_', ' ');

  return (
    <div>
      <Text className={classes.label}>{label}</Text>
      {fields.map((item, index) => (
        <Card key={item.id} className={classes.card}>
          <Controller
            control={control}
            name={`${name}.${index}`}
            render={({ field }) => (
              <ItemInput
                ref={index === fields.length - 1 ? inputRef : undefined}
                value={field.value}
                categories={categories}
                onChange={field.onChange}
              />
            )}
          />
          <Tooltip content="Remove item" relationship="label">
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
        onClick={() => {
          append({ category: ItemCategory.CONSUME, id: 1, counts: 100 });
          queueMicrotask(() =>
            inputRef.current?.querySelector('input')?.focus(),
          );
        }}
      >
        Add Item
      </Button>
    </div>
  );
};

const MydeckRewardInput = () => {
  return <ItemListInput name="mydeck_reward" />;
};

const RentalRewardInput = () => {
  const { control } = useFormContext<Chapter>();
  const rentalDeck = useWatch({ control, name: 'rental_deck' });

  return <ItemListInput name="rental_reward" disabled={Boolean(!rentalDeck)} />;
};

const unlockCategories = [ItemCategory.CONSUME];

const UnlockInput = () => {
  return <ItemListInput name="unlock" categories={unlockCategories} />;
};

const RewardInput = () => {
  return <ItemListInput name="reward" />;
};

const UnlockPackInput = () => {
  const classes = useListStyles();
  const { setValue, getValues } = useFormContext<Chapter>();
  const fields = useWatch<Chapter, 'unlock_pack'>({ name: 'unlock_pack' });
  const inputRef = useRef<HTMLDivElement>(null);

  const append = useCallback(
    (packId: number) =>
      setValue('unlock_pack', [...(getValues('unlock_pack') || []), packId]),
    [getValues, setValue],
  );

  const remove = useCallback(
    (index: number) =>
      setValue('unlock_pack', getValues('unlock_pack')?.toSpliced(index, 1)),
    [getValues, setValue],
  );

  const update = useCallback(
    (index: number, packId: number) =>
      setValue(
        'unlock_pack',
        getValues('unlock_pack')?.toSpliced(index, 1, packId),
      ),
    [getValues, setValue],
  );

  return (
    <div>
      <Text className={classes.label}>unlock pack</Text>
      {fields?.map((packId, index) => (
        <Card key={index} className={classes.card}>
          <div className={classes.fullWidth}>
            <CardPackInput
              ref={index === fields.length - 1 ? inputRef : undefined}
              required
              label="pack"
              value={packId}
              onChange={(newPackId) => update(index, newPackId)}
            />
          </div>
          <Tooltip content="Remove Pack" relationship="label">
            <Button
              icon={<Subtract16Regular />}
              onClick={() => remove(index)}
            />
          </Tooltip>
        </Card>
      ))}
      <Button
        icon={<Add16Regular />}
        onClick={() => {
          append(9001);
          queueMicrotask(() =>
            inputRef.current?.querySelector('input')?.focus(),
          );
        }}
      >
        Add Pack
      </Button>
    </div>
  );
};

const DifficultyInput = () => {
  const classes = useStyles();
  const { control } = useFormContext<DuelChapter>();

  return (
    <Controller
      control={control}
      name="difficulty"
      render={({ field }) => (
        <Field label="difficulty">
          <div className={classes.difficultyContainer}>
            <Rating
              value={field.value}
              onChange={(_, data) => field.onChange(data.value)}
            />
            <Button
              aria-label="Delete"
              icon={<StarOffRegular />}
              onClick={() => field.onChange(0)}
            />
          </div>
        </Field>
      )}
    />
  );
};

interface AccessoryInputProps {
  name:
    | 'player_mat'
    | 'cpu_mat'
    | 'player_sleeve'
    | 'cpu_sleeve'
    | 'player_icon'
    | 'cpu_icon'
    | 'player_icon_frame'
    | 'cpu_icon_frame'
    | 'player_avatar'
    | 'cpu_avatar'
    | 'player_avatar_home'
    | 'cpu_avatar_home'
    | 'player_duel_object'
    | 'cpu_duel_object';
  category: ItemCategory;
}

const AccessoryInput = ({ name, category }: AccessoryInputProps) => {
  const { control } = useFormContext<DuelChapter>();

  const label = name.replaceAll('_', ' ');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ItemIdInput
          required
          includeNone
          label={label}
          category={category}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
};
