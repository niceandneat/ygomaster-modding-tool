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
  BaseChapter,
  Chapter,
  DuelChapter,
  Gate,
  GateSummary,
  RewardChapter,
  UnlockChapter,
  UnlockType,
  isRewardChapter,
  isUnlockChapter,
} from '../../../common/type';
import { useWarnNavigation } from '../../hooks/useWarnNavigation';
import { getChapterName } from '../../utils/getChapterName';
import { ChaptersInput } from '../chapter/ChaptersInput';
import { ComboboxInput } from '../input/ComboboxInput';
import { PlainInput } from '../input/PlainInput';
import { GateChapterInput } from './GateChapterInput';
import { GateTotalRewardsAndUnlocks } from './GateTotalRewardsAndUnlocks';

const defaultGate: Gate = {
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
  const baseChapter: BaseChapter = {
    id: chapter.id,
    parent_id: chapter.parent_id,
    description: chapter.description,
    unlock_pack: chapter.unlock_pack,
  };

  if (isUnlockChapter(chapter)) {
    return {
      ...baseChapter,
      type: chapter.type,
      // Make sure all unlocks are UnlockType.ITEM
      // NOTE Should we consider UnlockType.HAS_ITEM too?
      unlock: chapter.unlock.map((u) => ({ ...u, type: UnlockType.ITEM })),
    } satisfies UnlockChapter;
  }

  if (isRewardChapter(chapter)) {
    return {
      ...baseChapter,
      type: chapter.type,
      reward: chapter.reward,
    } satisfies RewardChapter;
  }

  // if isDuelChapter(chapter)
  return {
    ...baseChapter,
    type: chapter.type,
    cpu_deck: chapter.cpu_deck,
    rental_deck: chapter.rental_deck,
    mydeck_reward: chapter.mydeck_reward,
    rental_reward: chapter.rental_reward,
    difficulty: chapter.difficulty,
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
  title?: string;
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
    // Gate IDs should be larger than default MD's gates not to use default background images.
    // TODO Lower this min to be just above tutorial gates (ex. 3) when there is background setting feature.
    const id = Math.max(...gates.map(({ id }) => id), 100) + 1;
    const priority = Math.max(...gates.map(({ priority }) => priority), 0) + 1;
    const clear_chapter = { gateId: id, chapterId: 0 };

    return { ...defaultGate, id, priority, clear_chapter };
  }, [gates]);
  const methods = useForm<Gate>({
    defaultValues: { ...defaultValuesForCreation, ...gate },
  });
  const { handleSubmit, reset, getValues, setValue, watch, formState } =
    methods;
  const [initialGateId] = useState(getValues('id'));

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

  // Reset self clear_chapter when id gets changed
  useEffect(() => {
    let prevId = initialGateId;

    const subscription = watch((value, { name }) => {
      if (name === 'id' && value.id !== undefined) {
        if (value.clear_chapter?.gateId === prevId) {
          // If use clear_chapter.gateId to update gateId, render function of Controller component cannot get updated gateId for clear_chapter
          setValue('clear_chapter', {
            ...getValues('clear_chapter'),
            gateId: value.id,
          });
        }
        prevId = value.id;
      }
    });

    return () => subscription.unsubscribe();
  }, [getValues, initialGateId, setValue, watch]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleGateSubmit)}>
        <div className={classes.header}>
          <Title1 className={classes.title}>{title || 'Gate'}</Title1>
          <Button icon={<SaveRegular />} type="submit" appearance="primary">
            Save
          </Button>
        </div>
        <div className={classes.stack}>
          <PlainInput<Gate>
            name="id"
            number
            integer
            rules={{
              min: { value: 101, message: 'id should be larger than 100' },
            }}
          />
          <ParentIdInput gates={gates} />
          <PlainInput<Gate> name="name" />
          <PlainInput<Gate> name="description" multiline />
          <PlainInput<Gate> name="priority" number integer />
          <ClearChapterInput gates={gates} loadChapters={loadChapters} />
          <ChaptersForUnlockInput gates={gates} loadChapters={loadChapters} />
          <ChaptersInput />
          <GateTotalRewardsAndUnlocks />
          <div className={classes.split}>
            <PlainInput<Gate> name="illust_id" number integer />
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

const optionToString = (option?: ParentIdOption) => {
  if (!option) return '';
  if (option.id === 0) return 'Make this gate a parent';
  return option.name;
};
const compareValues = (a?: ParentIdOption, b?: ParentIdOption) =>
  Boolean(a && b && a.id === b.id);
const fuseOptions: IFuseOptions<ParentIdOption> = {
  keys: ['name'],
};

const ParentIdInput = ({ gates }: ParentIdInputProps) => {
  const classes = useStyles();
  const { control, getValues } = useFormContext<Gate>();

  const options = useMemo<ParentIdOption[]>(
    () => [
      { id: 0, name: '' },
      ...gates
        .filter((gate) => gate.id !== getValues('id') && gate.parent_id === 0)
        .map(({ id, name }) => ({ id, name: `${name} (${id})` })),
    ],
    [gates, getValues],
  );

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
            value={selectedOption}
            options={options}
            fuseOptions={fuseOptions}
            onChange={(value) => field.onChange(value.id)}
            valueToString={optionToString}
            compareValues={compareValues}
          >
            {({ value }) => (
              <div className={classes.menuitem}>{optionToString(value)}</div>
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
  const { control, formState } = useFormContext<Gate>();
  const chapters = useWatch<Gate, 'chapters'>({ name: 'chapters' });
  const currentGateId = useWatch<Gate, 'id'>({ name: 'id' });
  const [initialGateId] = useState(currentGateId);

  // Ensure current gate is one the options
  // When creating new gate, there is no gate file. So `gates` does not have current gate as elements.
  const gateOptions = useMemo<{ id: number; name: string }[]>(
    () => [
      { id: currentGateId, name: 'This gate' },
      ...gates.filter((gate) => gate.id !== initialGateId),
    ],
    [currentGateId, gates, initialGateId],
  );

  const chaptersInSameGates = useMemo(
    () =>
      chapters.map((chapter) => ({
        id: chapter.id,
        name: getChapterName(chapter),
      })),
    // TODO Improve memo rule
    [chapters],
  );

  const handleLoadChaptersInSameGate = useCallback(
    async () => chaptersInSameGates,
    [chaptersInSameGates],
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
                value.gateId !== currentGateId ||
                chaptersInSameGates.some(({ id }) => id === value.chapterId) ||
                'This chapter is not exist',
            },
          }}
          render={({ field }) => {
            return (
              <GateChapterInput
                value={field.value}
                gates={gateOptions}
                validationMessage={error?.message}
                loadChapters={
                  field.value.gateId === currentGateId
                    ? handleLoadChaptersInSameGate
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

interface ChaptersForUnlockProps {
  gates: GateSummary[];
  loadChapters: (gateId: number) => Promise<{ id: number; name: string }[]>;
}

const ChaptersForUnlockInput = ({
  gates,
  loadChapters,
}: ChaptersForUnlockProps) => {
  const classes = useGateChapterListStyle();
  const { control, formState, getValues } = useFormContext<Gate>();
  const { fields, append, remove } = useFieldArray<Gate, 'unlock'>({
    name: 'unlock',
  });

  const [initialGateId] = useState(getValues('id'));
  const externalGates = useMemo(
    () => gates.filter((gate) => gate.id !== initialGateId),
    [initialGateId, gates],
  );

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
        Add a chapter for unlock
      </Button>
    </div>
  );
};
