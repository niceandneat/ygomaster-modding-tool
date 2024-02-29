import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  AlignCenterHorizontal24Regular,
  AlignCenterVertical24Regular,
  FullScreenMaximize24Regular,
  FullScreenMinimize24Regular,
} from '@fluentui/react-icons';
import { memo, useState } from 'react';
import {
  DefaultEdgeOptions,
  MarkerType,
  MiniMap,
  NodeTypes,
  Panel,
  ProOptions,
  ReactFlow,
} from 'reactflow';

import { Chapter } from '../../../common/type';
import { ChapterNode } from './ChapterNode';
import { useChaptersFlow } from './useChaptersFlow';

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '600px',
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    zIndex: 10,
  },
  flow: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  minimap: {
    opacity: 0.8,
    backgroundColor: tokens.colorNeutralBackground3,

    '& .react-flow__minimap-mask': {
      fill: tokens.colorNeutralBackground1,
    },

    '& .react-flow__minimap-node': {
      fill: tokens.colorNeutralBackground1,
      stroke: 'none',
    },
  },
});

interface ChaptersFlowProps {
  onChangeChapters: (chapters: Chapter[]) => void;
  onChangeSelection: (chapter?: Chapter) => void;
}

const nodeTypes: NodeTypes = {
  chapterNode: ChapterNode,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  style: { strokeWidth: 1 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
};

const proOptions: ProOptions = { hideAttribution: true };

const ChaptersFlowComponent = ({
  onChangeChapters,
  onChangeSelection,
}: ChaptersFlowProps) => {
  const classes = useStyles();
  const [fullscreen, setFullscreen] = useState(false);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onEdgeUpdate,
    onConnect,
    onConnectStart,
    onConnectEnd,
    isValidConnection,
    onSelectionChange,
    onLayout,
  } = useChaptersFlow({ onChangeChapters, onChangeSelection });

  return (
    <div
      className={mergeClasses(
        classes.container,
        fullscreen && classes.fullscreen,
      )}
    >
      <ReactFlow
        className={classes.flow}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeUpdate={onEdgeUpdate}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
      >
        <MiniMap className={classes.minimap} />
        <Panel position="top-left">
          <Toolbar aria-label="with Tooltip" size="small">
            <Tooltip
              content="Switch fullscreen view"
              relationship="description"
              withArrow
            >
              <ToolbarButton
                onClick={() => setFullscreen((s) => !s)}
                aria-label="fullscreen control"
                icon={
                  fullscreen ? (
                    <FullScreenMinimize24Regular />
                  ) : (
                    <FullScreenMaximize24Regular />
                  )
                }
              />
            </Tooltip>
            <ToolbarDivider />
            <Tooltip
              content="Align nodes vertically"
              relationship="description"
              withArrow
            >
              <ToolbarButton
                onClick={() => onLayout('TB')}
                aria-label="vertical layout"
                icon={<AlignCenterVertical24Regular />}
              />
            </Tooltip>
            <Tooltip
              content="Align nodes horizontally"
              relationship="description"
              withArrow
            >
              <ToolbarButton
                onClick={() => onLayout('LR')}
                aria-label="horizontal layout"
                icon={<AlignCenterHorizontal24Regular />}
              />
            </Tooltip>
          </Toolbar>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const ChaptersFlow = memo(ChaptersFlowComponent);
