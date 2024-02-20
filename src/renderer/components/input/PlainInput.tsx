import { Field, Input, Textarea } from '@fluentui/react-components';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { handleNumberInput } from '../../utils/handleNumberInput';

interface PlainInputProps<T extends FieldValues> {
  name: Path<T>;
  optional?: boolean;
  number?: boolean;
  multiline?: boolean;
}

export const PlainInput = <T extends FieldValues>({
  name,
  optional,
  number,
  multiline,
}: PlainInputProps<T>) => {
  const { control, formState } = useFormContext<T>();

  const error = formState.errors[name]?.message;
  const label = name.replaceAll('_', ' ');
  const Component = multiline ? Textarea : Input;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field
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
