import {
  Button,
  Field,
  Input,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowCircleDown24Regular,
  ArrowCircleUp24Regular,
} from '@fluentui/react-icons';
import { UseComboboxStateChange, useCombobox } from 'downshift';
import Fuse, { IFuseOptions } from 'fuse.js';
import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { debounce } from '../../utils/debounce';

const useStyles = makeStyles({
  container: {
    position: 'relative',
  },
  input: {
    minWidth: '0px',
  },
  menu: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxHeight: '400px',
    paddingBottom: '4px',
    paddingTop: '4px',
    marginTop: '4px',
    overflowY: 'auto',
    zIndex: 10,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
  },
  menuitem: {},
  menuitemHighlight: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
  },
  menuitemSelected: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  defaultContents: {
    ...shorthands.padding(tokens.spacingVerticalM),
  },
});

interface ComboboxInputProps<T> {
  value: T;
  options: T[];
  label: string;
  fuseOptions?: IFuseOptions<T>;
  onChange: (value: T) => void;
  valueToString?: (value: T) => string;
  children?: (props: { value: T }) => ReactNode;
}

const DefaultContents = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <div className={classes.defaultContents}>{children}</div>;
};

const defaultValueToString = (value?: unknown) => String(value ?? '');

export const ComboboxInput = <T,>({
  value,
  options,
  label,
  fuseOptions,
  onChange,
  valueToString = defaultValueToString,
  children,
}: ComboboxInputProps<T>) => {
  const classes = useStyles();
  const [items, setItems] = useState(() => options.slice(0, 100));
  const [inputValue, setInputValue] = useState<string>(() =>
    valueToString(value),
  );

  const handleItemToString = useCallback(
    (item: T | null) => (item ? valueToString(item) : ''),
    [valueToString],
  );

  const handleSelectedItemChange = useCallback(
    ({ selectedItem }: UseComboboxStateChange<T>) =>
      selectedItem && onChange(selectedItem),
    [onChange],
  );

  const handleIsOpenChange = useCallback(
    ({ isOpen, selectedItem }: UseComboboxStateChange<T>) => {
      if (!isOpen && selectedItem) {
        setInputValue(valueToString(selectedItem));
      }
    },
    [valueToString],
  );

  const applyInputChange = useMemo(() => {
    const fuse = new Fuse(options, fuseOptions);

    return debounce((inputValue = '') => {
      if (!inputValue) return setItems(options.slice(0, 100));
      setItems(fuse.search(inputValue, { limit: 20 }).map(({ item }) => item));
    }, 100);
  }, [options, fuseOptions]);

  useEffect(() => {
    setInputValue(valueToString(value));
  }, [value, valueToString]);

  useEffect(() => {
    applyInputChange(inputValue);
  }, [options, inputValue, applyInputChange]);

  const {
    isOpen,
    highlightedIndex,
    getLabelProps,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    openMenu,
  } = useCombobox({
    inputValue,
    items,
    itemToString: handleItemToString,
    selectedItem: value,
    onSelectedItemChange: handleSelectedItemChange,
    onIsOpenChange: handleIsOpenChange,
    defaultHighlightedIndex: 0,
  });

  const handleInputValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      openMenu();
    },
    [openMenu],
  );

  const render: (props: { value: T }) => ReactNode =
    children ||
    (({ value }) => <DefaultContents>{valueToString(value)}</DefaultContents>);

  return (
    <div className={classes.container}>
      <Field
        label={{
          ...(getLabelProps() as ReturnType<typeof getLabelProps>),
          children: label,
        }}
      >
        <Input
          {...getInputProps()}
          placeholder="Category"
          className={classes.input}
          // https://github.com/downshift-js/downshift/issues/1108#issuecomment-842407759
          value={inputValue}
          onChange={handleInputValueChange}
          contentAfter={
            <Button
              appearance="transparent"
              size="small"
              icon={
                isOpen ? (
                  <ArrowCircleUp24Regular />
                ) : (
                  <ArrowCircleDown24Regular />
                )
              }
              {...getToggleButtonProps()}
            />
          }
        />
      </Field>
      <div
        className={classes.menu}
        style={{ display: !(isOpen && items.length) ? 'none' : undefined }}
        {...getMenuProps()}
      >
        {isOpen &&
          items.map((item, index) => (
            <div
              key={valueToString(item)}
              className={mergeClasses(
                classes.menuitem,
                index === highlightedIndex && classes.menuitemHighlight,
                item === value && classes.menuitemSelected,
              )}
              {...getItemProps({ item, index })}
            >
              {render({ value: item })}
            </div>
          ))}
      </div>
    </div>
  );
};
