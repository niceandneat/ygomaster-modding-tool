import {
  MenuItem,
  MenuList,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { MouseEvent, useCallback, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';

import { Chapter, ChapterType } from '../../../common/type';
import { ChapterColor } from './ChapterNode';

const WIDTH = 120;
const HEIGHT = 80;

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    width: `${WIDTH}px`,
    height: `${HEIGHT}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: tokens.shadow16,
    backgroundColor: tokens.colorNeutralBackground1,
    zIndex: 10,
  },
});

const Inicator = ({ type }: { type: ChapterType }) => (
  <div
    style={{ width: 16, height: 16, backgroundColor: ChapterColor[type] }}
  ></div>
);

interface ChapterContextMenuProps {
  position?: { x: number; y: number };
  onClick: (type: ChapterType) => void;
}

export const ChapterContextMenu = ({
  position,
  onClick,
}: ChapterContextMenuProps) => {
  const classes = useStyles();

  if (!position) return null;

  return (
    <div
      className={classes.container}
      style={{ top: position.y, left: position.x }}
    >
      <MenuList>
        {(['Duel', 'Gate'] as ChapterType[]).map((type) => (
          <MenuItem
            key={type}
            icon={<Inicator type={type} />}
            onClick={() => onClick(type)}
          >
            {type}
          </MenuItem>
        ))}
      </MenuList>
    </div>
  );
};

export const useChapterContextMenu = (
  addChapter: (args: {
    position?: { x: number; y: number };
    data?: Partial<Chapter>;
  }) => void,
) => {
  const flowRef = useRef<HTMLDivElement>(null);
  const [nodePosition, setNodePosition] = useState<{ x: number; y: number }>();
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>();
  const { screenToFlowPosition } = useReactFlow<Chapter>();

  const closeMenu = useCallback(() => {
    setNodePosition(undefined);
    setMenuPosition(undefined);
  }, []);

  const onPaneContextMenu = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();

      const pane = flowRef.current?.getBoundingClientRect();
      if (!pane) return;

      const clientPosition = { x: event.clientX, y: event.clientY };

      setNodePosition(screenToFlowPosition(clientPosition));

      const rawMenuPosition = {
        x: clientPosition.x - pane.x,
        y: clientPosition.y - pane.y,
      };

      setMenuPosition({
        x:
          pane.width - rawMenuPosition.x < WIDTH
            ? rawMenuPosition.x - WIDTH
            : rawMenuPosition.x,
        y:
          pane.height - rawMenuPosition.y < HEIGHT
            ? rawMenuPosition.y - HEIGHT
            : rawMenuPosition.y,
      });
    },
    [screenToFlowPosition],
  );

  const onClick = useCallback(
    (type: ChapterType) => {
      if (!nodePosition) return;

      addChapter({ position: nodePosition, data: { type } });
      closeMenu();
    },
    [addChapter, closeMenu, nodePosition],
  );

  return {
    menuProps: { position: menuPosition, onClick },
    flowRef,
    closeMenu,
    onPaneContextMenu,
  };
};
