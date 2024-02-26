import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

import { Chapter } from '../../../common/type';
import { useAppStore } from '../../store';
import { ChapterDetailView } from './ChapterDetailView';

const useStyles = makeStyles({
  container: {
    width: '800px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  contents: {
    backgroundColor: tokens.colorNeutralBackground2,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
  },
});

interface ChapterDetailProps {
  chapter?: Chapter;
  onChange?: (chapter: Chapter) => void;
  onClose?: () => void;
}

export const ChapterDetail = ({
  chapter,
  onChange,
  onClose,
}: ChapterDetailProps) => {
  const classes = useStyles();
  const { deckPath } = useAppStore((s) => s.settings);

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
          Chapter Detail
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
