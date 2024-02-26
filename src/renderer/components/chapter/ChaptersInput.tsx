import {
  Button,
  Card,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add16Regular,
  Edit16Regular,
  Subtract16Regular,
} from '@fluentui/react-icons';
import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Chapter, Gate } from '../../../common/type';
import { useStateRef } from '../../hooks/useStateRef';
import { debounce } from '../../utils/debounce';
import { PlainInput } from '../input/PlainInput';
import { ChapterDetail } from './ChapterDetail';

const useStyles = makeStyles({
  label: {
    display: 'block',
    marginBottom: tokens.spacingVerticalS,
  },
  chapterCard: {
    marginBottom: tokens.spacingVerticalM,
  },
  chapterCardInputs: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    columnGap: tokens.spacingHorizontalM,
  },
});

export const ChaptersInput = () => {
  const classes = useStyles();
  const [chapterIndex, setChapterIndex, chapterIndexRef] = useStateRef(-1);

  const { getValues } = useFormContext<Gate>();
  const { fields, append, remove, update } = useFieldArray<Gate>({
    name: 'chapters',
  });

  const handleChange = useMemo(
    () =>
      debounce((chapter: Chapter) => {
        if (chapterIndexRef.current !== -1) {
          update(chapterIndexRef.current, chapter);
        }
      }, 100),
    [chapterIndexRef, update],
  );

  const handleClose = useCallback(() => setChapterIndex(-1), [setChapterIndex]);

  const initialChapter = useMemo(
    () => getValues().chapters[chapterIndex],
    [chapterIndex, getValues],
  );

  return (
    <div>
      <Text className={classes.label}>chapters</Text>
      {fields.map((item, index) => (
        <Card key={item.id} className={classes.chapterCard}>
          <div className={classes.chapterCardInputs}>
            <PlainInput<Gate> name={`chapters.${index}.id`} number />
            <PlainInput<Gate> name={`chapters.${index}.parent_id`} number />
            <Tooltip content="Edit chapter" relationship="label">
              <Button
                icon={<Edit16Regular />}
                onClick={() => setChapterIndex(index)}
              />
            </Tooltip>
            <Tooltip content="Remove chapter" relationship="label">
              <Button
                icon={<Subtract16Regular />}
                onClick={() => {
                  remove(index);
                  handleClose();
                }}
              />
            </Tooltip>
          </div>
        </Card>
      ))}
      <ChapterDetail
        key={chapterIndex}
        chapter={initialChapter}
        onChange={handleChange}
        onClose={handleClose}
      />
      <Button
        icon={<Add16Regular />}
        onClick={() =>
          append({
            id: 0,
            parent_id: 0,
            description: '',
            type: 'Duel',
            cpu_deck: '',
            rental_deck: '',
            mydeck_reward: [],
            rental_reward: [],
            cpu_hand: 6,
            player_hand: 5,
            cpu_name: 'CPU',
            cpu_flag: 'None',
            cpu_value: 98,
          })
        }
      >
        Add Chapter
      </Button>
    </div>
  );
};
