import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { Add16Regular } from '@fluentui/react-icons';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { memo } from 'react';

import { ChapterType, DuelChapter, GateChapter } from '../../../common/type';
import { NodeType } from './useChaptersFlow';

export const ChapterColor: Record<ChapterType, string> = {
  Duel: tokens.colorPaletteLightGreenBackground2,
  Gate: tokens.colorPaletteBlueBackground2,
};

const useStyles = makeStyles({
  container: {
    ...shorthands.border('1px', 'solid', tokens.colorNeutralForeground1),
    borderRadius: '10px',
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: '120px',
    maxWidth: '240px',
    columnGap: tokens.spacingHorizontalS,
    overflow: 'hidden',
  },
  selected: {
    ...shorthands.border('1px', 'solid', tokens.colorBrandForeground1),
  },
  handle: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
    width: '20px',
    height: '20px',
    '& *': {
      pointerEvents: 'none',
    },
  },
  targetHandle: {},
  sourceHandle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorPaletteGreenBackground3,
  },
  tag: {
    fontSize: '10px',
    paddingLeft: '10px',
  },
  duelTag: {
    backgroundColor: ChapterColor.Duel,
  },
  gateTag: {
    backgroundColor: ChapterColor.Gate,
  },
  contents: {
    ...shorthands.padding('16px'),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});

const ChapterNodeComponent = (props: NodeProps<NodeType>) => {
  const {
    data,
    isConnectable,
    targetPosition = Position.Left,
    sourcePosition = Position.Right,
  } = props;

  const classes = useStyles();

  return (
    <>
      <Handle
        type="target"
        className={mergeClasses(classes.handle, classes.targetHandle)}
        position={targetPosition}
        isConnectable={isConnectable}
      />
      {data.type === 'Duel' ? (
        <DuelChapterNodeContents {...props} data={data} />
      ) : (
        <GateChapterNodeContents {...props} data={data} />
      )}
      <Handle
        type="source"
        className={mergeClasses(classes.handle, classes.sourceHandle)}
        position={sourcePosition}
        isConnectable={isConnectable}
      >
        <Add16Regular />
      </Handle>
    </>
  );
};

export const ChapterNode = memo(ChapterNodeComponent);

const DuelChapterNodeContents = ({
  data,
  selected,
}: NodeProps<Node<DuelChapter>>) => {
  const classes = useStyles();

  return (
    <div
      className={mergeClasses(classes.container, selected && classes.selected)}
    >
      <div className={mergeClasses(classes.tag, classes.duelTag)}>Duel</div>
      <div className={classes.contents}>{data.cpu_deck || 'Edit Chapter'}</div>
    </div>
  );
};

const GateChapterNodeContents = ({
  data,
  selected,
}: NodeProps<Node<GateChapter>>) => {
  const classes = useStyles();

  return (
    <div
      className={mergeClasses(classes.container, selected && classes.selected)}
    >
      <div className={mergeClasses(classes.tag, classes.gateTag)}>Gate</div>
      <div className={classes.contents}>{data.id}</div>
    </div>
  );
};
