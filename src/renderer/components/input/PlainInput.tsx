import { Field, Input, Textarea, makeStyles } from '@fluentui/react-components';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { handleNumberInput } from '../../utils/handleNumberInput';

const useStyles = makeStyles({
  container: {
    '& textarea': {
      minHeight: '84px',
    },
  },
});

interface PlainInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  optional?: boolean;
  number?: boolean;
  multiline?: boolean;
}

export const PlainInput = <T extends FieldValues>({
  name,
  label: labelInput,
  optional,
  number,
  multiline,
}: PlainInputProps<T>) => {
  const classes = useStyles();
  const { control, formState } = useFormContext<T>();

  const error = formState.errors[name]?.message;
  const label = labelInput || name.replaceAll('_', ' ');
  const Component = multiline ? Textarea : Input;

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: !optional && 'This field is required' }}
      render={({ field }) => (
        <Field
          className={classes.container}
          label={label}
          required={!optional}
          validationMessage={error?.toString()}
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
