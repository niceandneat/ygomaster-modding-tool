import {
  Button,
  Card,
  Dropdown,
  Field,
  Option,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add16Regular,
  ArrowShuffle16Regular,
  Subtract16Regular,
} from '@fluentui/react-icons';
import { useCallback, useEffect } from 'react';
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
  defaultGateChapter,
} from '../../../common/type';
import { ygoItems } from '../../data';
import { debounce } from '../../utils/debounce';
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
    rowGap: tokens.spacingVerticalL,
    marginBottom: '128px',
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

const useItemListStyle = makeStyles({
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
    defaultValues: { ...defaultGateChapter, ...defaultDuelChapter, ...chapter },
  });
  const { watch, control, trigger, setValue } = methods;

  const randomizeAccessories = useCallback(() => {
    const field = getRandomItem(ygoItems.get(ItemCategory.FIELD));

    setValue('player_mat', field);
    setValue('cpu_mat', field);
    setValue('player_duel_object', field + 10000);
    setValue('cpu_duel_object', field + 10000);
    setValue('player_avatar_home', field + 20000);
    setValue('cpu_avatar_home', field + 20000);
    setValue(
      'player_sleeve',
      getRandomItem(ygoItems.get(ItemCategory.PROTECTOR)),
    );
    setValue('cpu_sleeve', getRandomItem(ygoItems.get(ItemCategory.PROTECTOR)));
    setValue('player_icon', getRandomItem(ygoItems.get(ItemCategory.ICON)));
    setValue('cpu_icon', getRandomItem(ygoItems.get(ItemCategory.ICON)));
    setValue(
      'player_icon_frame',
      getRandomItem(ygoItems.get(ItemCategory.ICON_FRAME)),
    );
    setValue(
      'cpu_icon_frame',
      getRandomItem(ygoItems.get(ItemCategory.ICON_FRAME)),
    );
    setValue('player_avatar', getRandomItem(ygoItems.get(ItemCategory.AVATAR)));
    setValue('cpu_avatar', getRandomItem(ygoItems.get(ItemCategory.AVATAR)));
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
                <Option value="Duel">Duel</Option>
                <Option value="Gate">Gate</Option>
              </Dropdown>
            </Field>
          )}
        />
        <PlainInput<Chapter> name="description" multiline />
        {type === 'Duel' && (
          <>
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
        {type === 'Gate' && <UnlockInput />}
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
const getFileName = (path: string) => path.split('\\').pop()?.split('/').pop();

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
              const fileName = getFileName(filePath);
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
  const classes = useItemListStyle();
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
            name={`${name}.${index}`}
            render={({ field }) => (
              <ItemInput
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
        onClick={() =>
          append({ category: ItemCategory.CONSUME, id: 1, counts: 100 })
        }
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
          label={label}
          category={category}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
};
