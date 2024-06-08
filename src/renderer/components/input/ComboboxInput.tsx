import {
  Button,
  Field,
  Input,
  Text,
  makeStyles,
  mergeClasses,
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
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { debounce } from '../../utils/debounce';

const useStyles = makeStyles({
  container: {
    position: 'relative',
  },
  inputContainer: {
    position: 'relative',
    display: 'grid',
  },
  input: {
    minWidth: '0px',
  },
  inputValueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '90%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    overflow: 'hidden',
    padding: `0 calc(${tokens.spacingHorizontalMNudge} + 1px)`, // 1px for adding border width of input
  },
  inputValue: {
    padding: `0 ${tokens.spacingHorizontalXXS}`,
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
    padding: `0 ${tokens.spacingVerticalM}`,
  },
});

type OptionRenderFunction<T> = (props: {
  value: T;
  highlighted: boolean;
  selected: boolean;
}) => ReactNode;

interface ComboboxInputProps<T> {
  value?: T;
  options: T[];
  label: string;
  fuseOptions?: IFuseOptions<T>;
  required?: boolean;
  placeholder?: string;
  validationMessage?: string;
  onChange: (value: T) => void;
  onChangeHighlight?: (change?: { value: T; node: HTMLDivElement }) => void;
  valueToString?: (value?: T) => string;
  compareValues?: (a?: T, b?: T) => boolean;
  children?: OptionRenderFunction<T>;
}

const DefaultContents = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return <div className={classes.defaultContents}>{children}</div>;
};

const defaultValueToString = (value?: unknown) => String(value ?? '');
const defaultCompareValue = (a?: unknown, b?: unknown) => a === b;

export const ComboboxInput = <T,>({
  value,
  options,
  label,
  fuseOptions,
  required,
  placeholder,
  validationMessage,
  onChange,
  onChangeHighlight,
  valueToString = defaultValueToString,
  compareValues = defaultCompareValue,
  children,
}: ComboboxInputProps<T>) => {
  const classes = useStyles();
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(() => options.slice(0, 100));
  const [inputValue, setInputValue] = useState('');

  const handleItemToString = useCallback(
    (item: T | null) => (item ? valueToString(item) : ''),
    [valueToString],
  );

  const handleSelectedItemChange = useCallback(
    ({ selectedItem }: UseComboboxStateChange<T>) => {
      selectedItem && onChange(selectedItem);
      onChangeHighlight?.(undefined);
    },
    [onChange, onChangeHighlight],
  );

  const handleIsOpenChange = useCallback(
    ({ isOpen }: UseComboboxStateChange<T>) => !isOpen && setInputValue(''),
    [],
  );

  const handleInputValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
    [],
  );

  const {
    isOpen,
    highlightedIndex,
    getLabelProps,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getItemProps,
  } = useCombobox({
    inputValue,
    items,
    itemToString: handleItemToString,
    selectedItem: value,
    onSelectedItemChange: handleSelectedItemChange,
    onIsOpenChange: handleIsOpenChange,
    defaultHighlightedIndex: 0,
  });

  const updateItems = useMemo(() => {
    const fuse = new Fuse(options, fuseOptions);

    return (inputValue = '') => {
      const items = inputValue
        ? fuse.search(inputValue, { limit: 20 }).map(({ item }) => item)
        : options.slice(0, 100);

      setItems(items);
    };
  }, [fuseOptions, options]);

  const debouncedUpdateItems = useMemo(
    () => debounce(updateItems, 100),
    [updateItems],
  );

  // Prevent blink of previous items list on first input change.
  const prevIsOpened = useRef(false);
  useLayoutEffect(() => {
    if (!prevIsOpened.current) {
      updateItems(inputValue);
    } else {
      debouncedUpdateItems(inputValue);
    }

    prevIsOpened.current = isOpen;
  }, [isOpen, inputValue, updateItems, debouncedUpdateItems]);

  // Sync states with props change.
  useEffect(() => {
    updateItems();
  }, [updateItems]);

  useEffect(() => {
    if (!onChangeHighlight || !optionsContainerRef.current) return;
    if (highlightedIndex < 0 || items.length === 0)
      return onChangeHighlight(undefined);

    const node = optionsContainerRef.current.children[highlightedIndex] as
      | HTMLDivElement
      | undefined;

    if (!node) return onChangeHighlight(undefined);

    onChangeHighlight({ value: items[highlightedIndex], node });
  }, [highlightedIndex, items, onChangeHighlight]);

  const render: OptionRenderFunction<T> =
    children ||
    (({ value }) => <DefaultContents>{valueToString(value)}</DefaultContents>);

  return (
    <div className={classes.container}>
      <Field
        required={required}
        validationMessage={validationMessage}
        label={{
          ...(getLabelProps() as ReturnType<typeof getLabelProps>),
          children: label,
        }}
      >
        <div className={classes.inputContainer}>
          <Input
            // https://github.com/downshift-js/downshift/issues/1108#issuecomment-842407759
            {...getInputProps({ onChange: handleInputValueChange })}
            required={false}
            placeholder={valueToString(value) ? undefined : placeholder}
            className={classes.input}
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
          {!inputValue && (
            <div className={classes.inputValueContainer}>
              <Text className={classes.inputValue} wrap={false} truncate>
                {valueToString(value)}
              </Text>
            </div>
          )}
        </div>
      </Field>
      <div
        className={classes.menu}
        style={{ display: !(isOpen && items.length) ? 'none' : undefined }}
        {...getMenuProps({ ref: optionsContainerRef })}
      >
        {isOpen &&
          items.map((item, index) => {
            const highlighted = index === highlightedIndex;
            const selected = compareValues(item, value);

            return (
              <div
                key={index}
                className={mergeClasses(
                  classes.menuitem,
                  highlighted && classes.menuitemHighlight,
                  selected && classes.menuitemSelected,
                )}
                {...getItemProps({ item, index })}
              >
                {render({ value: item, highlighted, selected })}
              </div>
            );
          })}
      </div>
    </div>
  );
};
