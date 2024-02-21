import {
  Button,
  Card,
  Combobox,
  Field,
  Option,
  Text,
  Title1,
  Tooltip,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {
  Add16Regular,
  SaveRegular,
  Subtract16Regular,
} from '@fluentui/react-icons';
import { useEffect } from 'react';
import {
  Controller,
  FieldArrayPath,
  FormProvider,
  Path,
  SubmitHandler,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { Solo } from '../../../common/type';
import { useWarnNavigation } from '../../hooks/useWarnNavigation';
import { FileInput } from '../input/FileInput';
import { PlainInput } from '../input/PlainInput';

const defaultSolo: Partial<Solo> = {
  id: 0,
  description: '',
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

const useStyles = makeStyles({
  container: {
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
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

interface SoloDetailViewProps {
  title: string;
  solo?: Solo;
  deckPath?: string;
  onSubmit: SubmitHandler<Solo>;
}

export const SoloDetailView = ({
  title,
  solo,
  deckPath,
  onSubmit,
}: SoloDetailViewProps) => {
  const classes = useStyles();
  const methods = useForm<Solo>({ defaultValues: { ...defaultSolo, ...solo } });
  const { handleSubmit, reset, formState } = methods;

  const { isDirty, isSubmitSuccessful } = formState;
  useWarnNavigation(isDirty && !isSubmitSuccessful);

  useEffect(() => {
    reset({ ...defaultSolo, ...solo });
  }, [solo, reset]);

  return (
    <div className={classes.container}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={classes.header}>
            <Title1 className={classes.title}>{title}</Title1>
            <Button icon={<SaveRegular />} type="submit" appearance="primary">
              Save
            </Button>
          </div>
          <div className={classes.stack}>
            <PlainInput<Solo> name="id" number />
            <PlainInput<Solo> name="description" multiline />
            <FileNameInput name="cpu_deck" path={deckPath} />
            <FileNameInput name="rental_deck" path={deckPath} optional />
            <MydeckRewardInput />
            <RentalRewardInput />
            <PlainInput<Solo> name="cpu_hand" number />
            <PlainInput<Solo> name="player_hand" number />
            <PlainInput<Solo> name="cpu_flag" />
            <PlainInput<Solo> name="cpu_name" />
            <PlainInput<Solo> name="cpu_value" number />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

interface FileInputProps {
  name: Path<Solo>;
  path?: string;
  optional?: boolean;
}

const FileNameInput = ({ name, path, optional }: FileInputProps) => {
  const { control } = useFormContext<Solo>();

  const label = name.replaceAll('_', ' ');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field label={label} required={!optional}>
          <FileInput
            onChange={(filePath) => field.onChange(filePath.split('/').at(-1))}
            value={field.value?.toString()}
            path={path}
            placeholder="Select deck file"
          />
        </Field>
      )}
    />
  );
};

interface RewardInputProps {
  name: FieldArrayPath<Solo>;
  disabled?: boolean;
}

const rewardOptions = [
  'GEM',
  'DARK_ORB',
  'LIGHT_ORB',
  'FIRE_ORB',
  'WARTER_ORB',
  'EARTH_ORB',
  'WIND_ORB',
  'CARD',
  'STRUCTURE',
];

const RewardInput = ({ name, disabled }: RewardInputProps) => {
  const classes = useStyles();
  const { control } = useFormContext<Solo>();
  const { fields, append, remove } = useFieldArray<Solo>({ name });

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
                  {rewardOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Combobox>
              </Field>
            )}
          />
          <PlainInput name={`${name}.${index}.value`} number />
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
        onClick={() => append({ category: 'GEM', value: 100 })}
      >
        Add Reward
      </Button>
    </div>
  );
};

const MydeckRewardInput = () => {
  return <RewardInput name="mydeck_reward" />;
};

const RentalRewardInput = () => {
  const { control } = useFormContext<Solo>();
  const rentalDeck = useWatch({ control, name: 'rental_deck' });

  return <RewardInput name="rental_reward" disabled={Boolean(!rentalDeck)} />;
};
