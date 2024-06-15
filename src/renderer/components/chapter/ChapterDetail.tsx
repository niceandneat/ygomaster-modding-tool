import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DeleteRegular, Dismiss24Regular } from '@fluentui/react-icons';

import { Chapter } from '../../../common/type';
import { useAppStore } from '../../store';
import { ChapterDetailView } from './ChapterDetailView';

const useStyles = makeStyles({
  container: {
    width: '656px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  contents: {
    backgroundColor: tokens.colorNeutralBackground2,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: tokens.spacingHorizontalM,
  },
});

interface ChapterDetailProps {
  chapter?: Chapter;
  onChange?: (chapter: Chapter) => void;
  onDelete?: () => void;
  onClose?: () => void;
}

export const ChapterDetail = ({
  chapter,
  onChange,
  onDelete,
  onClose,
}: ChapterDetailProps) => {
  const classes = useStyles();
  const { deckPath } = useAppStore((s) => s.paths);

  return (
    <OverlayDrawer
      className={classes.container}
      modalType="non-modal"
      position="end"
      open={Boolean(chapter)}
      onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          }
        >
          <div className={classes.header}>
            <div>Chapter Detail</div>
            <Button
              aria-label="Delete"
              icon={<DeleteRegular />}
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody className={classes.contents}>
        <ChapterDetailView
          chapter={chapter}
          deckPath={deckPath}
          onChange={onChange}
        />
      </DrawerBody>
    </OverlayDrawer>
  );
};
