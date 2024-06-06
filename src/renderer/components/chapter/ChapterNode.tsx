import {
  Text,
  Tooltip,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { Add16Regular } from '@fluentui/react-icons';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { memo } from 'react';

import {
  ChapterType,
  DuelChapter,
  GateChapter,
  Item,
  ItemCategory,
} from '../../../common/type';
import { ygoItemsMap } from '../../data';
import { AssetImage } from '../common/AssetImage';
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
    width: '180px',
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
    ...shorthands.padding(tokens.spacingHorizontalL),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: tokens.spacingHorizontalL,
  },
});

const useItemListStyles = makeStyles({
  container: {
    width: '100%',
  },
  title: {
    paddingTop: tokens.spacingHorizontalXXS,
    paddingBottom: tokens.spacingHorizontalXXS,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: tokens.colorPalettePlatinumBackground2,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalS,
  },
  iconContainer: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: '24px',
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
      <div className={classes.contents}>
        <Text align="center">{data.cpu_deck || 'Edit Chapter'}</Text>
        {data.mydeck_reward.length ? (
          <NodeItemList title="mydeck reward" items={data.mydeck_reward} />
        ) : null}
        {data.rental_reward?.length ? (
          <NodeItemList title="rental reward" items={data.rental_reward} />
        ) : null}
      </div>
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
      <div className={classes.contents}>
        <Text align="center">{data.id}</Text>
        {data.unlock.length ? (
          <NodeItemList title="unlock" items={data.unlock} />
        ) : null}
      </div>
    </div>
  );
};

const NodeItemList = ({ items, title }: { items: Item[]; title: string }) => {
  const classes = useItemListStyles();

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Text>{title}</Text>
      </div>
      {items.map((item, index) => {
        const shouldShowText = [
          ItemCategory.NONE,
          ItemCategory.PROFILE_TAG,
        ].includes(item.category);

        const name =
          ygoItemsMap.get(item.category)?.get(item.id)?.name ?? item.id;

        return (
          <div key={index} className={classes.listItem}>
            {shouldShowText ? (
              <Text>{ItemCategory[item.category]}</Text>
            ) : (
              <div className={classes.iconContainer}>
                <Tooltip
                  content={name}
                  relationship="description"
                  positioning="before"
                >
                  <AssetImage
                    thumbnail
                    alt={name}
                    className={classes.icon}
                    category={item.category}
                    item={item.id}
                  />
                </Tooltip>
              </div>
            )}
            <Text>{item.counts}</Text>
          </div>
        );
      })}
    </div>
  );
};
