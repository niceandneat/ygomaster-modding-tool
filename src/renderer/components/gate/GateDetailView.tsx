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
  SubmitHandler,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { Gate } from '../../../common/type';
import { useWarnNavigation } from '../../hooks/useWarnNavigation';
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
  solos: [],
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
  soloCard: {
    marginBottom: tokens.spacingVerticalM,
  },
  soloCardInputs: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    columnGap: tokens.spacingHorizontalM,
  },
  rewardCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

interface GateDetailViewProps {
  title: string;
  gate?: Gate;
  soloIds?: number[];
  onSubmit: SubmitHandler<Gate>;
}

export const GateDetailView = ({
  title,
  gate,
  onSubmit,
}: GateDetailViewProps) => {
  const classes = useStyles();
  const methods = useForm<Gate>({ defaultValues: { ...defaultGate, ...gate } });
  const { handleSubmit, reset, formState } = methods;

  const { isDirty, isSubmitSuccessful } = formState;
  useWarnNavigation(isDirty && !isSubmitSuccessful);

  useEffect(() => {
    reset({ ...defaultGate, ...gate });
  }, [gate, reset]);

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
            <PlainInput<Gate> name="id" number />
            <PlainInput<Gate> name="parent_id" number />
            <PlainInput<Gate> name="name" />
            <PlainInput<Gate> name="description" multiline />
            <PlainInput<Gate> name="priority" number />
            <PlainInput<Gate> name="illust_id" number />
            <PlainInput<Gate> name="illust_x" number />
            <PlainInput<Gate> name="illust_y" number />
            <SolosInput />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

const SolosInput = () => {
  const classes = useStyles();
  const { getValues } = useFormContext<Gate>();
  const { fields, append, remove } = useFieldArray<Gate>({ name: 'solos' });

  return (
    <div>
      <Text className={classes.label}>solos</Text>
      {fields.map((item, index) => (
        <Card key={item.id} className={classes.soloCard}>
          <div className={classes.soloCardInputs}>
            <PlainInput<Gate> name={`solos.${index}.id`} number />
            <PlainInput<Gate> name={`solos.${index}.parent_id`} number />
            <Tooltip content="Remove solo" relationship="label">
              <Button
                icon={<Subtract16Regular />}
                onClick={() => remove(index)}
              />
            </Tooltip>
          </div>
          <UnlockInput name={`solos.${index}.unlock`} />
        </Card>
      ))}
      <Button
        icon={<Add16Regular />}
        onClick={() =>
          append({
            id: 0,
            parent_id: getValues().solos.at(-1)?.id ?? 0,
            unlock: [],
          })
        }
      >
        Add Solo
      </Button>
    </div>
  );
};

interface UnlockInputProps {
  name: Exclude<FieldArrayPath<Gate>, 'solos'>;
}

const unlockOptions = [
  'DARK_ORB',
  'LIGHT_ORB',
  'FIRE_ORB',
  'WARTER_ORB',
  'EARTH_ORB',
  'WIND_ORB',
];

const UnlockInput = ({ name }: UnlockInputProps) => {
  const classes = useStyles();
  const { control } = useFormContext<Gate>();
  const { fields, append, remove } = useFieldArray<Gate>({ name });

  return (
    <div>
      <Text className={classes.label}>unlock</Text>
      {fields.map((item, index) => (
        <Card key={item.id} className={classes.rewardCard}>
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
                  {unlockOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Combobox>
              </Field>
            )}
          />
          <PlainInput<Gate> name={`${name}.${index}.value`} />
          <Tooltip content="Remove unlock item" relationship="label">
            <Button
              icon={<Subtract16Regular />}
              onClick={() => remove(index)}
            />
          </Tooltip>
        </Card>
      ))}
      <Button
        icon={<Add16Regular />}
        onClick={() => append({ category: 'DARK_ORB', value: 100 })}
      >
        Add Unlock
      </Button>
    </div>
  );
};
