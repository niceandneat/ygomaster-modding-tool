import { Field, Input, Textarea, makeStyles } from '@fluentui/react-components';
import {
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from 'react-hook-form';

import { handleNumberInput } from '../../utils/handleNumberInput';

const useStyles = makeStyles({
  container: {
    '& textarea': {
      minHeight: '84px',
    },
  },
});

interface PlainInputProps<
  T extends FieldValues,
  Name extends Path<T> = Path<T>,
> {
  name: Name;
  label?: string;
  optional?: boolean;
  number?: boolean;
  integer?: boolean;
  multiline?: boolean;
  rules?: ControllerProps<T, Name>['rules'];
}

export const PlainInput = <
  T extends FieldValues,
  Name extends Path<T> = Path<T>,
>({
  name,
  label: labelInput,
  optional,
  number,
  integer,
  multiline,
  rules,
}: PlainInputProps<T, Name>) => {
  const classes = useStyles();
  const { control, formState } = useFormContext<T>();

  const error = formState.errors[name];
  const label = labelInput || name.replaceAll('_', ' ');
  const Component = multiline ? Textarea : Input;

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: !optional && 'This field is required',
        ...rules,
        validate: {
          ...(integer
            ? {
                integer: (v: PathValue<T, Name>) =>
                  Number.isInteger(v) || 'Only integers are allowed',
              }
            : undefined),
          ...rules?.validate,
        },
      }}
      render={({ field }) => (
        <Field
          className={classes.container}
          label={label}
          required={!optional}
          validationMessage={error?.message?.toString()}
        >
          <Component
            resize="vertical"
            type={number ? 'number' : 'text'}
            name={field.name}
            value={field.value?.toString()}
            onChange={
              number ? handleNumberInput(field.onChange) : field.onChange
            }
          />
        </Field>
      )}
    />
  );
};
