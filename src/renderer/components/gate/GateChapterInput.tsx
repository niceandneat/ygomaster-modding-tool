import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChapterReference } from '../../../common/type';
import { ComboboxInput } from '../input/ComboboxInput';

const useStyles = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
  },
  menuitem: {
    padding: tokens.spacingVerticalM,
  },
});

interface GateOption {
  id: number;
  name: string;
}

interface ChapterOption {
  id: number;
  name: string;
}

interface GateChapterInputProps {
  className?: string;
  value: ChapterReference;
  gates: GateOption[];
  validationMessage?: string;
  loadChapters: (gateId: number) => Promise<ChapterOption[]>;
  onChange: (value: ChapterReference) => void;
}

const gateOptionToString = (option?: GateOption) => option?.name ?? '';
const gateCompareValues = (a?: GateOption, b?: GateOption) =>
  Boolean(a && b && a.id === b.id);
const gateFuseOptions: IFuseOptions<GateOption> = {
  keys: ['name'],
};

const chapterOptionToString = (option?: ChapterOption) => option?.name ?? '';
const chapterCompareValues = (a?: ChapterOption, b?: ChapterOption) =>
  Boolean(a && b && a.id === b.id);
const chapterFuseOptions: IFuseOptions<ChapterOption> = {
  keys: ['name'],
};

export const GateChapterInput = ({
  className,
  value,
  gates,
  validationMessage,
  loadChapters,
  onChange,
}: GateChapterInputProps) => {
  const classes = useStyles();

  const [chapters, setChapters] = useState<ChapterOption[]>([]);
  const valueRef = useRef<ChapterReference>(value);
  valueRef.current = value;

  const handleGateOptionChange = useCallback(
    async ({ id }: GateOption) => {
      if (valueRef.current.gateId === id) return;
      onChange({ ...valueRef.current, gateId: id, chapterId: 0 });

      const newChapters = await loadChapters(id);
      setChapters(newChapters);
    },
    [loadChapters, onChange],
  );

  const handleChapterOptionChange = useCallback(
    ({ id }: ChapterOption) => {
      if (valueRef.current.chapterId === id) return;
      onChange({ ...valueRef.current, chapterId: id });
    },
    [onChange],
  );

  const gateValue = useMemo<GateOption | undefined>(() => {
    if (value.gateId === 0) return { id: 0, name: '' };
    return {
      id: value.gateId,
      name:
        gates.find((gate) => gate.id === value.gateId)?.name ??
        String(value.gateId),
    };
  }, [gates, value.gateId]);

  const chapterValue = useMemo<ChapterOption | undefined>(() => {
    if (value.chapterId === 0) return { id: 0, name: '' };
    return {
      id: value.chapterId,
      name:
        chapters.find((chapter) => chapter.id === value.chapterId)?.name ??
        String(value.chapterId),
    };
  }, [chapters, value.chapterId]);

  useEffect(() => {
    const loadChapterOptions = async () => {
      const newChapters = await loadChapters(value.gateId);
      setChapters(newChapters);
    };

    loadChapterOptions();
  }, [loadChapters, value.gateId]);

  return (
    <div className={mergeClasses(classes.container, className)}>
      <ComboboxInput
        required
        label="gate"
        placeholder="Select gate"
        value={gateValue}
        options={gates}
        fuseOptions={gateFuseOptions}
        onChange={handleGateOptionChange}
        valueToString={gateOptionToString}
        compareValues={gateCompareValues}
      >
        {({ value }) => <div className={classes.menuitem}>{value.name}</div>}
      </ComboboxInput>
      <ComboboxInput
        required
        label="chapter"
        placeholder="Select chapter"
        value={chapterValue}
        options={chapters}
        fuseOptions={chapterFuseOptions}
        validationMessage={validationMessage}
        onChange={handleChapterOptionChange}
        valueToString={chapterOptionToString}
        compareValues={chapterCompareValues}
      >
        {({ value }) => <div className={classes.menuitem}>{value.name}</div>}
      </ComboboxInput>
    </div>
  );
};
