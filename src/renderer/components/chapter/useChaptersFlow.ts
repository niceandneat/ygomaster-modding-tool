import Dagre from '@dagrejs/dagre';
import {
  Edge,
  IsValidConnection,
  Node,
  OnBeforeDelete,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  OnEdgeUpdateFunc,
  OnEdgesChange,
  OnNodesChange,
  OnSelectionChangeFunc,
  Position,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  updateEdge,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';

import {
  Chapter,
  Gate,
  defaultDuelChapter,
  defaultRewardChapter,
  defaultUnlockChapter,
} from '../../../common/type';

type LayoutDirection = 'LR' | 'TB';
export type NodeType = Node<Chapter, 'chapter'>;
export type EdgeType = Edge<Chapter>;

const DATA_CHANGES = ['remove', 'add', 'replace'];

const getNodeSize = (node: Node) => ({
  width: node.measured?.width ?? 0,
  height: node.measured?.height ?? 0,
});

const getLayoutedNodes = (
  nodes: NodeType[],
  edges: EdgeType[],
  direction: LayoutDirection = 'TB',
) => {
  if (!nodes.length) return [];

  const dagreGraph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, align: 'DR' });

  nodes.forEach((node) => dagreGraph.setNode(node.id, getNodeSize(node)));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  Dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    const size = getNodeSize(node);
    const position = {
      x: nodeWithPosition.x - (size.width ?? 0) / 2,
      y: nodeWithPosition.y - (size.height ?? 0) / 2,
    };

    return { ...node, targetPosition, sourcePosition, position };
  });
};

interface UseChaptersInputFlowParams {
  onChangeChapters: (chapters: Chapter[]) => void;
  onChangeSelection: (chapter?: Chapter) => void;
}

export const useChaptersFlow = ({
  onChangeChapters,
  onChangeSelection,
}: UseChaptersInputFlowParams) => {
  const { fitView, getNode, getNodes, getEdges, screenToFlowPosition } =
    useReactFlow<NodeType, EdgeType>();

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const [loaded, setLoaded] = useState(false);

  const connectingNodeId = useRef<string>();
  const layoutDirection = useRef<LayoutDirection>('LR');

  const chapters = useWatch<Gate, 'chapters'>({ name: 'chapters' });
  useEffect(() => {
    const nodeMap = new Map(getNodes().map((node) => [node.data.id, node]));

    const isHorizontal = layoutDirection.current === 'LR';
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    const newNodes = chapters.map((chapter) => {
      return {
        id: `${chapter.id}`,
        // Hide before layout
        position: { x: 10000, y: 10000 },
        type: 'chapter' as const,
        targetPosition,
        sourcePosition,
        ...nodeMap.get(chapter.id),
        data: chapter,
      };
    });

    const newEdges = chapters
      .filter((chapter) => chapter.parent_id !== 0)
      .map((chapter) => {
        return {
          id: `${chapter.parent_id}_${chapter.id}`,
          source: `${chapter.parent_id}`,
          target: `${chapter.id}`,
        };
      });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [chapters, getNodes]);

  const addChapter = useCallback(
    ({
      position = { x: 0, y: 0 },
      data,
    }: {
      position?: { x: number; y: number };
      data?: Partial<Chapter>;
    }) => {
      const id = Math.max(...getNodes().map(({ data }) => data.id), 0) + 1;

      const isHorizontal = layoutDirection.current === 'LR';
      const targetPosition = isHorizontal ? Position.Left : Position.Top;
      const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

      const newNode: NodeType = {
        id: `${id}`,
        position,
        data: {
          ...defaultUnlockChapter,
          ...defaultRewardChapter,
          ...defaultDuelChapter,
          id,
          parent_id: 0,
          ...data,
        },
        type: 'chapter',
        targetPosition,
        sourcePosition,
      };

      const newNodes = [...getNodes(), newNode];

      setNodes(newNodes);
      onChangeChapters(newNodes.map(({ data }) => data));
    },
    [getNodes, onChangeChapters],
  );

  const onNodesChange = useCallback<OnNodesChange<NodeType>>(
    (changes) => {
      const newNodes = applyNodeChanges(changes, getNodes());
      setNodes(newNodes);

      if (changes.some((change) => DATA_CHANGES.includes(change.type))) {
        onChangeChapters(newNodes.map(({ data }) => data));
      }

      if (changes.some((change) => change.type === 'dimensions')) {
        setLoaded(true);
      }
    },
    [getNodes, onChangeChapters],
  );

  const onEdgesChange = useCallback<OnEdgesChange<EdgeType>>(
    (changes) => {
      const newEdges = applyEdgeChanges(changes, getEdges());
      setEdges(newEdges);

      if (changes.some((change) => DATA_CHANGES.includes(change.type))) {
        const idToParentId = new Map(
          newEdges.map((edge) => [Number(edge.target), Number(edge.source)]),
        );

        const newNodes = getNodes().map((node) => {
          return {
            ...node,
            data: {
              ...node.data,
              parent_id: idToParentId.get(node.data.id) ?? 0,
            },
          };
        });

        setNodes(newNodes);
        onChangeChapters(newNodes.map(({ data }) => data));
      }
    },
    [getEdges, getNodes, onChangeChapters],
  );

  const onEdgeUpdate = useCallback<OnEdgeUpdateFunc<EdgeType>>(
    (oldEdge, connection) => {
      const newEdges = updateEdge(oldEdge, connection, getEdges());
      setEdges(newEdges);

      if (connection.target) {
        const newNodes = getNodes().map((node) => {
          if (node.id === connection.target) {
            return {
              ...node,
              data: {
                ...node.data,
                parent_id: Number(connection.source ?? 0),
              },
            };
          }

          return node;
        });

        setNodes(newNodes);
        onChangeChapters(newNodes.map(({ data }) => data));
      }
    },
    [getEdges, getNodes, onChangeChapters],
  );

  const onBeforeDelete = useCallback<
    OnBeforeDelete<NodeType, EdgeType>
  >(async () => {
    const response = await window.electron.showMessageBox({
      message: 'Are you sure?',
      buttons: ['yes', 'no'],
      cancelId: 1,
    });

    return response === 0;
  }, []);

  const onConnect = useCallback<OnConnect>(
    (connection) => {
      const newEdges = addEdge(connection, getEdges());
      setEdges(newEdges);

      // reset the start node on connections
      connectingNodeId.current = undefined;

      if (connection.target) {
        const newNodes = getNodes().map((node) => {
          if (node.id === connection.target) {
            return {
              ...node,
              data: {
                ...node.data,
                parent_id: Number(connection.source ?? 0),
              },
            };
          }

          return node;
        });

        setNodes(newNodes);
        onChangeChapters(newNodes.map(({ data }) => data));
      }
    },
    [getEdges, getNodes, onChangeChapters],
  );

  const onConnectStart = useCallback<OnConnectStart>((_, { nodeId }) => {
    connectingNodeId.current = nodeId ?? undefined;
  }, []);

  const onConnectEnd = useCallback<OnConnectEnd>(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = (event.target as HTMLElement).classList.contains(
        'react-flow__pane',
      );

      if (targetIsPane && event instanceof MouseEvent) {
        const parentNode = getNode(connectingNodeId.current);
        addChapter({
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: { parent_id: parentNode?.data.id ?? 0, type: 'Duel' },
        });
      }
    },
    [addChapter, getNode, screenToFlowPosition],
  );

  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => connection.target !== connection.source,
    [],
  );

  const onSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes }) => {
      const [selectedNode] = nodes;
      onChangeSelection(selectedNode?.data as Chapter | undefined);
    },
    [onChangeSelection],
  );

  const onLayout = useCallback(
    (direction: LayoutDirection) => {
      const newNodes = getLayoutedNodes(getNodes(), getEdges(), direction);

      setNodes(newNodes);
      layoutDirection.current = direction;

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [fitView, getEdges, getNodes, setNodes],
  );

  useEffect(() => {
    loaded &&
      window.requestAnimationFrame(() => {
        onLayout('LR');
      });
  }, [loaded, onLayout]);

  return {
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
  };
};
