import {
  Button,
  Title1,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { SaveRegular } from '@fluentui/react-icons';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useMemo } from 'react';
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import {
  Chapter,
  Gate,
  isDuelChapter,
  isGateChapter,
} from '../../../common/type';
import { useWarnNavigation } from '../../hooks/useWarnNavigation';
import { ChaptersInput } from '../chapter/ChaptersInput';
import { ComboboxInput } from '../input/ComboboxInput';
import { PlainInput } from '../input/PlainInput';

const defaultGate: Partial<Gate> = {
  id: 0,
  parent_id: 0,
  name: '',
  description: '',
  illust_id: 4027,
  illust_x: 0.03,
  illust_y: 0,
  priority: 0,
  clear_chapter: 1,
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
    ...shorthands.padding(tokens.spacingVerticalM),
  },
});

const extractOnlyRelevantFields = (chapter: Chapter): Chapter => {
  if (isGateChapter(chapter)) {
    const { id, parent_id, description, type, unlock } = chapter;
    return { id, parent_id, description, type, unlock };
  }

  const {
    id,
    parent_id,
    description,
    type,
    cpu_deck,
    rental_deck,
    mydeck_reward,
    rental_reward,
    cpu_hand,
    player_hand,
    cpu_name,
    cpu_flag,
    cpu_value,
  } = chapter;
  return {
    id,
    parent_id,
    description,
    type,
    cpu_deck,
    rental_deck,
    mydeck_reward,
    rental_reward,
    cpu_hand,
    player_hand,
    cpu_name,
    cpu_flag,
    cpu_value,
  };
};

interface GateDetailViewProps {
  title: string;
  gate?: Gate;
  chapterIds?: number[];
  onSubmit: SubmitHandler<Gate>;
}

export const GateDetailView = ({
  title,
  gate,
  onSubmit,
}: GateDetailViewProps) => {
  const classes = useStyles();
  const methods = useForm<Gate>({ defaultValues: { ...defaultGate, ...gate } });
  const { handleSubmit, formState } = methods;

  const { isDirty, isSubmitSuccessful } = formState;
  useWarnNavigation(isDirty && !isSubmitSuccessful);

  const handleGateSubmit = useCallback(
    (gate: Gate) =>
      onSubmit({
        ...gate,
        chapters: gate.chapters.map(extractOnlyRelevantFields),
      }),
    [onSubmit],
  );

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
          <PlainInput<Gate> name="parent_id" number />
          <PlainInput<Gate> name="name" />
          <PlainInput<Gate> name="description" multiline />
          <PlainInput<Gate> name="priority" number />
          <ClearChapterInput />
          <ChaptersInput />
          <PlainInput<Gate> name="illust_id" number />
          <PlainInput<Gate> name="illust_x" number />
          <PlainInput<Gate> name="illust_y" number />
        </div>
      </form>
    </FormProvider>
  );
};

interface ClearChapterOption {
  id: number;
  name?: string;
}

const optionToString = (option?: ClearChapterOption) => option?.name ?? '';
const fuseOptions: IFuseOptions<ClearChapterOption> = {
  keys: ['name'],
};

const ClearChapterInput = () => {
  const classes = useStyles();
  const { control, formState } = useFormContext<Gate>();
  const chapters = useWatch<Gate, 'chapters'>({ name: 'chapters' });

  const options = useMemo(
    () =>
      chapters
        .filter(isDuelChapter)
        .map(({ id, cpu_deck }) => ({ id, name: cpu_deck })),
    [chapters],
  );

  const error = formState.errors.clear_chapter?.message;

  return (
    <Controller
      control={control}
      name="clear_chapter"
      rules={{
        required: 'This field is required',
        validate: {
          exists: (value = 0) => value > 0, // false if no matching chapter
        },
      }}
      render={({ field }) => {
        const selectedOption = options.find(({ id }) => id === field.value) ?? {
          id: -1,
          name: '',
        }; // for empty selected option input

        return (
          <ComboboxInput
            label="clear chapter"
            required
            validationMessage={error?.toString()}
            value={selectedOption}
            options={options}
            fuseOptions={fuseOptions}
            onChange={(value) => field.onChange(value.id)}
            valueToString={optionToString}
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
