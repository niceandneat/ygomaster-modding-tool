import { Label, makeStyles, tokens } from '@fluentui/react-components';
import { ReactFlowProvider, useStore as useFlowStore } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Chapter, Gate } from '../../../common/type';
import { useStateRef } from '../../hooks/useStateRef';
import { debounce } from '../../utils/debounce';
import { withMessageBox } from '../../utils/withMessageBox';
import { ChapterDetail } from './ChapterDetail';
import { ChaptersFlow } from './ChaptersFlow';

const useStyles = makeStyles({
  label: {
    display: 'block',
    marginBottom: tokens.spacingVerticalXXS,
    paddingBottom: tokens.spacingVerticalXXS,
  },
});

const ChaptersInputComponent = () => {
  const classes = useStyles();
  const [chapterIndex, setChapterIndex, chapterIndexRef] = useStateRef(-1);

  const { getValues } = useFormContext<Gate>();
  const { update, remove, replace } = useFieldArray<Gate>({ name: 'chapters' });
  const resetSelectedElements = useFlowStore((s) => s.resetSelectedElements);

  const handleClose = useCallback(() => {
    setChapterIndex(-1);
    resetSelectedElements();
  }, [setChapterIndex, resetSelectedElements]);

  const handleChangeFlow = useMemo(
    () => debounce((chapters: Chapter[]) => replace(chapters), 100),
    [replace],
  );

  const handleChangeForm = useCallback(
    (chapter: Chapter) => {
      if (chapterIndexRef.current !== -1) {
        update(chapterIndexRef.current, chapter);
      }
    },
    [chapterIndexRef, update],
  );

  const handleDeleteChapter = useCallback(() => {
    if (chapterIndexRef.current !== -1) {
      withMessageBox(() => {
        remove(chapterIndexRef.current);
      });
    }
  }, [chapterIndexRef, remove]);

  const handleChangeSelection = useCallback(
    (chapter?: Chapter) => {
      const index = getValues().chapters.findIndex(
        ({ id }) => id === chapter?.id,
      );
      setChapterIndex(index);
    },
    [getValues, setChapterIndex],
  );

  const initialChapter = useMemo(
    () => getValues().chapters[chapterIndex],
    [chapterIndex, getValues],
  );

  return (
    <div>
      <Label className={classes.label}>chapters</Label>
      <ChaptersFlow
        onChangeChapters={handleChangeFlow}
        onChangeSelection={handleChangeSelection}
      />
      <ChapterDetail
        key={chapterIndex}
        chapter={initialChapter}
        onChange={handleChangeForm}
        onDelete={handleDeleteChapter}
        onClose={handleClose}
      />
    </div>
  );
};

export const ChaptersInput = () => {
  return (
    <ReactFlowProvider>
      <ChaptersInputComponent />
    </ReactFlowProvider>
  );
};
