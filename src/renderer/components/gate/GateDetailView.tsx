import {
  Button,
  Card,
  Text,
  Title1,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add16Regular,
  SaveRegular,
  Subtract16Regular,
} from '@fluentui/react-icons';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import {
  Chapter,
  DuelChapter,
  Gate,
  GateChapter,
  GateSummary,
  UnlockType,
  isDuelChapter,
  isGateChapter,
} from '../../../common/type';
import { useWarnNavigation } from '../../hooks/useWarnNavigation';
import { getChapterName } from '../../utils/getChapterName';
import { ChaptersInput } from '../chapter/ChaptersInput';
import { ComboboxInput } from '../input/ComboboxInput';
import { PlainInput } from '../input/PlainInput';
import { GateChapterInput } from './GateChapterInput';
import { GateTotalRewardsAndUnlocks } from './GateTotalRewardsAndUnlocks';

const defaultGate: Partial<Gate> = {
  id: 0,
  parent_id: 0,
  name: '',
  description: '',
  illust_id: 4027,
  illust_x: 0.03,
  illust_y: 0,
  priority: 0,
  clear_chapter: { gateId: 0, chapterId: 0 },
  unlock: [],
  chapters: [],
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
  label: {
    display: 'block',
    marginBottom: tokens.spacingVerticalS,
  },
  rewardCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  menuitem: {
    padding: tokens.spacingVerticalM,
  },
});

const useGateChapterListStyle = makeStyles({
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

const extractOnlyRelevantFields = (chapter: Chapter): Chapter => {
  if (isGateChapter(chapter)) {
    return {
      id: chapter.id,
      parent_id: chapter.parent_id,
      description: chapter.description,
      type: chapter.type,
      // Make sure all unlocks are UnlockType.ITEM
      // NOTE Should we consider UnlockType.HAS_ITEM too?
      unlock: chapter.unlock.map((u) => ({ ...u, type: UnlockType.ITEM })),
    } satisfies GateChapter;
  }

  // if isDuelChapter(chapter)
  return {
    id: chapter.id,
    parent_id: chapter.parent_id,
    description: chapter.description,
    type: chapter.type,
    cpu_deck: chapter.cpu_deck,
    rental_deck: chapter.rental_deck,
    mydeck_reward: chapter.mydeck_reward,
    rental_reward: chapter.rental_reward,
    cpu_name: chapter.cpu_name,
    cpu_flag: chapter.cpu_flag,
    cpu_value: chapter.cpu_value,
    player_hand: chapter.player_hand,
    cpu_hand: chapter.cpu_hand,
    player_life: chapter.player_life,
    cpu_life: chapter.cpu_life,
    player_mat: chapter.player_mat,
    cpu_mat: chapter.cpu_mat,
    player_sleeve: chapter.player_sleeve,
    cpu_sleeve: chapter.cpu_sleeve,
    player_icon: chapter.player_icon,
    cpu_icon: chapter.cpu_icon,
    player_icon_frame: chapter.player_icon_frame,
    cpu_icon_frame: chapter.cpu_icon_frame,
    player_avatar: chapter.player_avatar,
    cpu_avatar: chapter.cpu_avatar,
    player_avatar_home: chapter.player_avatar_home,
    cpu_avatar_home: chapter.cpu_avatar_home,
    player_duel_object: chapter.player_duel_object,
    cpu_duel_object: chapter.cpu_duel_object,
  } satisfies DuelChapter;
};

interface GateDetailViewProps {
  title: string;
  gate?: Gate;
  gates: GateSummary[];
  loadChapters: (gateId: number) => Promise<{ id: number; name: string }[]>;
  onSubmit: (settings: Gate) => Promise<boolean>;
}

export const GateDetailView = ({
  title,
  gate,
  gates,
  loadChapters,
  onSubmit,
}: GateDetailViewProps) => {
  const classes = useStyles();

  const defaultValuesForCreation = useMemo(() => {
    const id = Math.max(...gates.map(({ id }) => id), 0) + 1;
    const priority = Math.max(...gates.map(({ priority }) => priority), 0) + 1;
    const clear_chapter = { gateId: id, chapterId: 0 };

    return { ...defaultGate, id, priority, clear_chapter };
  }, [gates]);
  const methods = useForm<Gate>({
    defaultValues: { ...defaultValuesForCreation, ...gate },
  });
  const { handleSubmit, reset, getValues, formState } = methods;

  const [succeed, setSucceed] = useState(false);
  useWarnNavigation(formState.isDirty);

  const handleGateSubmit = useCallback(
    async (gate: Gate) => {
      const succeed = await onSubmit({
        ...gate,
        chapters: gate.chapters.map(extractOnlyRelevantFields),
      });
      setSucceed(succeed);
    },
    [onSubmit],
  );

  // https://react-hook-form.com/docs/useform/reset
  // Avoid calling reset before useForm's useEffect is invoked,
  // this is because useForm's subscription needs to be ready before reset can send a signal to flush form state update.
  useEffect(() => {
    if (!succeed) return;

    reset({ ...defaultGate, ...getValues() });
    setSucceed(false);
  }, [getValues, reset, succeed]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleGateSubmit)}>
        <div className={classes.header}>
          <Title1 className={classes.title}>{title}</Title1>
          <Button icon={<SaveRegular />} type="submit" appearance="primary">
            Save
          </Button>
        </div>
        <div className={classes.stack}>
          <PlainInput<Gate> name="id" number />
          <ParentIdInput gates={gates} />
          <PlainInput<Gate> name="name" />
          <PlainInput<Gate> name="description" multiline />
          <PlainInput<Gate> name="priority" number />
          <ClearChapterInput gates={gates} loadChapters={loadChapters} />
          <GateChapterListInput gates={gates} loadChapters={loadChapters} />
          <ChaptersInput />
          <GateTotalRewardsAndUnlocks />
          <div className={classes.split}>
            <PlainInput<Gate> name="illust_id" number />
            <PlainInput<Gate> name="illust_x" number />
            <PlainInput<Gate> name="illust_y" number />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

interface ParentIdInputProps {
  gates: GateSummary[];
}

interface ParentIdOption {
  id: number;
  name: string;
}

const optionToString = (option?: ParentIdOption) => option?.name ?? '';
const compareValues = (a?: ParentIdOption, b?: ParentIdOption) =>
  Boolean(a && b && a.id === b.id);
const fuseOptions: IFuseOptions<ParentIdOption> = {
  keys: ['name'],
};

const ParentIdInput = ({ gates }: ParentIdInputProps) => {
  const classes = useStyles();
  const { control, formState, getValues } = useFormContext<Gate>();

  const options = useMemo<ParentIdOption[]>(
    () =>
      gates
        .filter((gate) => gate.id !== getValues('id'))
        .map(({ id, name }) => ({ id, name: `${name} (${id})` })),
    [gates, getValues],
  );

  const error = formState.errors.clear_chapter?.message;

  return (
    <Controller
      control={control}
      name="parent_id"
      render={({ field }) => {
        const selectedOption = options.find(({ id }) => id === field.value);

        return (
          <ComboboxInput
            label="parent gate"
            placeholder="Select gate"
            validationMessage={error?.toString()}
            value={{
              id: field.value,
              name: selectedOption
                ? `${selectedOption.name} (${selectedOption.id})`
                : '',
            }}
            options={options}
            fuseOptions={fuseOptions}
            onChange={(value) => field.onChange(value.id)}
            valueToString={optionToString}
            compareValues={compareValues}
          >
            {({ value }) => (
              <div className={classes.menuitem}>{value.name}</div>
            )}
          </ComboboxInput>
        );
      }}
    />
  );
};

interface ClearChapterInputProps {
  gates: GateSummary[];
  loadChapters: (gateId: number) => Promise<{ id: number; name: string }[]>;
}

const ClearChapterInput = ({ gates, loadChapters }: ClearChapterInputProps) => {
  const classes = useGateChapterListStyle();
  const { control, formState, getValues } = useFormContext<Gate>();
  const chapters = useWatch<Gate, 'chapters'>({ name: 'chapters' });

  const sameGateOptions = useMemo(
    () =>
      chapters
        .filter(isDuelChapter)
        .map((chapter) => ({ id: chapter.id, name: getChapterName(chapter) })),
    // TODO Improve memo rule
    [chapters],
  );

  const handleLoadSameGateChapters = useCallback(
    async () => sameGateOptions,
    [sameGateOptions],
  );

  const error = formState.errors.clear_chapter;

  return (
    <div>
      <Text className={classes.label}>clear chapter</Text>
      <Card className={classes.card}>
        <Controller
          control={control}
          name="clear_chapter"
          rules={{
            validate: {
              required: (value) =>
                value.chapterId > 0 || 'This field is required',
              exist: (value) =>
                value.gateId !== getValues('id') ||
                sameGateOptions.some(({ id }) => id === value.chapterId) ||
                'This chapter is not exist',
            },
          }}
          render={({ field }) => {
            return (
              <GateChapterInput
                value={field.value}
                gates={gates}
                validationMessage={error?.message}
                loadChapters={
                  field.value.gateId === getValues('id')
                    ? handleLoadSameGateChapters
                    : loadChapters
                }
                onChange={field.onChange}
              />
            );
          }}
        />
      </Card>
    </div>
  );
};

interface GateChapterListInputProps {
  gates: GateSummary[];
  loadChapters: (gateId: number) => Promise<{ id: number; name: string }[]>;
}

const GateChapterListInput = ({
  gates,
  loadChapters,
}: GateChapterListInputProps) => {
  const classes = useGateChapterListStyle();
  const { control, formState } = useFormContext<Gate>();
  const { fields, append, remove } = useFieldArray<Gate, 'unlock'>({
    name: 'unlock',
  });

  const currentGateId = useWatch<Gate, 'id'>({ name: 'id' });
  const externalGates = gates.filter((gate) => gate.id !== currentGateId);

  const error = formState.errors.unlock;

  return (
    <div>
      <Text className={classes.label}>unlock</Text>
      {fields.map((item, index) => (
        <Card key={item.id} className={classes.card}>
          <Controller
            control={control}
            name={`unlock.${index}`}
            rules={{
              validate: {
                required: (value) =>
                  value.chapterId > 0 || 'This field is required',
              },
            }}
            render={({ field }) => (
              <GateChapterInput
                value={field.value}
                gates={externalGates}
                validationMessage={error?.[index]?.message}
                loadChapters={loadChapters}
                onChange={field.onChange}
              />
            )}
          />
          <Tooltip content="Remove unlock chapter" relationship="label">
            <Button
              icon={<Subtract16Regular />}
              onClick={() => remove(index)}
            />
          </Tooltip>
        </Card>
      ))}
      <Button
        icon={<Add16Regular />}
        onClick={() =>
          append({
            type: UnlockType.CHAPTER_AND,
            gateId: externalGates[0].id,
            chapterId: 0,
          })
        }
      >
        Add Unlock Chapter
      </Button>
    </div>
  );
};
