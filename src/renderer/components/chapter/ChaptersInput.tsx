import { InfoLabel, makeStyles, tokens } from '@fluentui/react-components';
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
    marginBottom: tokens.spacingVerticalS,
  },
});

const ChaptersInputComponent = () => {
  const classes = useStyles();
  const [chapterIndex, setChapterIndex, chapterIndexRef] = useStateRef(-1);

  const { getValues, setValue } = useFormContext<Gate>();
  const { update, remove } = useFieldArray<Gate>({ name: 'chapters' });
  const resetSelectedElements = useFlowStore((s) => s.resetSelectedElements);

  const handleClose = useCallback(() => {
    setChapterIndex(-1);
    resetSelectedElements();
  }, [setChapterIndex, resetSelectedElements]);

  const handleChangeChapter = useMemo(
    () =>
      debounce((chapter: Chapter) => {
        if (chapterIndexRef.current !== -1) {
          update(chapterIndexRef.current, chapter);
        }
      }, 100),
    [chapterIndexRef, update],
  );

  const handleDeleteChapter = useCallback(() => {
    if (chapterIndexRef.current !== -1) {
      withMessageBox(() => {
        remove(chapterIndexRef.current);
      });
    }
  }, [chapterIndexRef, remove]);

  const handleChangeChapters = useCallback(
    (chapters: Chapter[]) => {
      setValue('chapters', chapters, { shouldDirty: true });
    },
    [setValue],
  );

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
      <InfoLabel
        className={classes.label}
        info="Click right mouse button to add a node."
      >
        chapters
      </InfoLabel>
      <ChaptersFlow
        onChangeChapters={handleChangeChapters}
        onChangeSelection={handleChangeSelection}
      />
      <ChapterDetail
        key={chapterIndex}
        chapter={initialChapter}
        onChange={handleChangeChapter}
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
