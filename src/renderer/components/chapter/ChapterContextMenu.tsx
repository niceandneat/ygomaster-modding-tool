import {
  MenuItem,
  MenuList,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DualScreenSpan24Regular } from '@fluentui/react-icons';
import { MouseEvent, useCallback, useRef, useState } from 'react';
import { Node, useReactFlow } from 'reactflow';

import { Chapter, ChapterType, isGateChapter } from '../../../common/type';
import { ChapterColor } from './ChapterNode';

const WIDTH = 160;

export const useChapterContextMenu = (
  addChapter: (args: {
    position?: { x: number; y: number };
    data?: Partial<Chapter>;
  }) => void,
) => {
  const flowRef = useRef<HTMLDivElement>(null);
  const [currentNode, setCurrentNode] = useState<Node<Chapter>>();
  const [nodePosition, setNodePosition] = useState<{ x: number; y: number }>();
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>();
  const { screenToFlowPosition } = useReactFlow<Chapter>();

  const closeMenu = useCallback(() => {
    setCurrentNode(undefined);
    setNodePosition(undefined);
    setMenuPosition(undefined);
  }, []);

  const changeMenuPosition = useCallback(
    (
      clientPosition: { x: number; y: number },
      size: { width: number; height: number },
    ) => {
      const pane = flowRef.current?.getBoundingClientRect();
      if (!pane) return;

      const rawMenuPosition = {
        x: clientPosition.x - pane.x,
        y: clientPosition.y - pane.y,
      };

      setMenuPosition({
        x:
          pane.width - rawMenuPosition.x < size.width
            ? rawMenuPosition.x - size.width
            : rawMenuPosition.x,
        y:
          pane.height - rawMenuPosition.y < size.height
            ? rawMenuPosition.y - size.height
            : rawMenuPosition.y,
      });
    },
    [],
  );

  const onPaneContextMenu = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();

      const clientPosition = { x: event.clientX, y: event.clientY };

      setCurrentNode(undefined);
      setNodePosition(screenToFlowPosition(clientPosition));
      changeMenuPosition(clientPosition, { width: WIDTH, height: 80 });
    },
    [screenToFlowPosition, changeMenuPosition],
  );

  const onNodeContextMenu = useCallback(
    (event: MouseEvent<Element>, node: Node<Chapter>) => {
      event.preventDefault();

      const clientPosition = { x: event.clientX, y: event.clientY };

      setNodePosition(undefined);
      setCurrentNode(node);
      changeMenuPosition(clientPosition, { width: WIDTH, height: 80 });
    },
    [changeMenuPosition],
  );

  const onClickChapterType = useCallback(
    (type: ChapterType) => {
      if (!nodePosition) return closeMenu();

      addChapter({ position: nodePosition, data: { type } });
      closeMenu();
    },
    [addChapter, closeMenu, nodePosition],
  );

  const onCreateMirror = useCallback(() => {
    if (!currentNode || isGateChapter(currentNode.data)) return closeMenu();

    const position = {
      x: currentNode.position.x,
      y: currentNode.position.y + (currentNode.height ?? 0) + 10,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataWithoutId } = currentNode.data;

    addChapter({
      position,
      data: {
        ...dataWithoutId,
        cpu_deck: dataWithoutId.rental_deck,
        mydeck_reward: dataWithoutId.rental_reward,
        rental_deck: dataWithoutId.cpu_deck,
        rental_reward: dataWithoutId.mydeck_reward,
      },
    });
    closeMenu();
  }, [addChapter, closeMenu, currentNode]);

  return {
    paneMenuProps: {
      position: nodePosition && menuPosition,
      onClick: onClickChapterType,
    } satisfies PaneContextMenuProps,
    nodeMenuProps: {
      position: currentNode && menuPosition,
      onCreateMirror,
    } satisfies NodeContextMenuProps,
    flowRef,
    closeMenu,
    onPaneContextMenu,
    onNodeContextMenu,
  };
};

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    width: `${WIDTH}px`,
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

interface PaneContextMenuProps {
  position?: { x: number; y: number };
  onClick: (type: ChapterType) => void;
}

export const PaneContextMenu = ({
  position,
  onClick,
}: PaneContextMenuProps) => {
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

interface NodeContextMenuProps {
  position?: { x: number; y: number };
  onCreateMirror: () => void;
}

export const NodeContextMenu = ({
  position,
  onCreateMirror,
}: NodeContextMenuProps) => {
  const classes = useStyles();

  if (!position) return null;

  return (
    <div
      className={classes.container}
      style={{ top: position.y, left: position.x }}
    >
      <MenuList>
        <MenuItem icon={<DualScreenSpan24Regular />} onClick={onCreateMirror}>
          Create Mirror
        </MenuItem>
      </MenuList>
    </div>
  );
};
