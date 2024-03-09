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
import {
  DefaultEdgeOptions,
  MarkerType,
  MiniMap,
  NodeTypes,
  Panel,
  ProOptions,
  ReactFlow,
} from '@xyflow/react';
import { memo, useState } from 'react';

import { Chapter } from '../../../common/type';
import {
  NodeContextMenu,
  PaneContextMenu,
  useChapterContextMenu,
} from './ChapterContextMenu';
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
  chapter: ChapterNode,
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
    addChapter,
    onNodesChange,
    onEdgesChange,
    onEdgeUpdate,
    onBeforeDelete,
    onConnect,
    onConnectStart,
    onConnectEnd,
    isValidConnection,
    onSelectionChange,
    onLayout,
  } = useChaptersFlow({ onChangeChapters, onChangeSelection });

  const {
    flowRef,
    paneMenuProps,
    nodeMenuProps,
    onPaneContextMenu,
    onNodeContextMenu,
    closeMenu,
  } = useChapterContextMenu(addChapter);

  return (
    <div
      className={mergeClasses(
        classes.container,
        fullscreen && classes.fullscreen,
      )}
    >
      <ReactFlow
        ref={flowRef}
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
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={closeMenu}
        onMoveStart={closeMenu}
        onBeforeDelete={onBeforeDelete}
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
        <PaneContextMenu {...paneMenuProps} />
        <NodeContextMenu {...nodeMenuProps} />
      </ReactFlow>
    </div>
  );
};

export const ChaptersFlow = memo(ChaptersFlowComponent);
