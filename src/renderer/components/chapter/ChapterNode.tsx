import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { Add16Regular } from '@fluentui/react-icons';
import { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

import { Chapter, DuelChapter, GateChapter } from '../../../common/type';

const useStyles = makeStyles({
  container: {
    ...shorthands.border('1px', 'solid', tokens.colorNeutralForeground1),
    ...shorthands.borderRadius('10px'),
    backgroundColor: tokens.colorNeutralBackground2,
    minWidth: '120px',
    maxWidth: '240px',
    columnGap: tokens.spacingHorizontalS,
    ...shorthands.overflow('hidden'),
  },
  selected: {
    ...shorthands.border('1px', 'solid', tokens.colorBrandForeground1),
  },
  handle: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
    width: '20px',
    height: '20px',
    '&.react-flow__handle-left': {
      left: '-10px',
    },
    '&.react-flow__handle-right': {
      right: '-10px',
    },
    '&.react-flow__handle-top': {
      top: '-10px',
    },
    '&.react-flow__handle-bottom': {
      bottom: '-10px',
    },
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
    backgroundColor: tokens.colorPaletteLightGreenBackground2,
  },
  gateTag: {
    backgroundColor: tokens.colorPaletteBlueBackground2,
  },
  contents: {
    ...shorthands.padding('16px'),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});

const ChapterNodeComponent = (props: NodeProps<Chapter>) => {
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
}: NodeProps<DuelChapter>) => {
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
}: NodeProps<GateChapter>) => {
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
