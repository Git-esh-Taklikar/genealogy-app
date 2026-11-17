import dagre from 'dagre';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 120;

/**
 * Takes React Flow nodes and edges, runs dagre layout algorithm,
 * returns nodes with computed x,y positions.
 *
 * - Nodes: 220px wide, 120px tall (for person cards)
 * - rankdir: 'TB' (top to bottom — ancestors at top)
 * - ranksep: 100 (vertical spacing between generations)
 * - nodesep: 60 (horizontal spacing)
 * - Spouse edges are handled by constraining spouses to the same rank.
 */
export function getLayoutedElements(nodes, edges, direction = 'TB') {
  if (!nodes.length) return { nodes: [], edges: [] };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 100,
    nodesep: 60,
    marginx: 40,
    marginy: 40,
  });

  // Separate spouse edges from parent edges for rank constraints
  const spouseEdges = edges.filter((e) => e.data?.relType === 'SPOUSE_OF');
  const parentEdges = edges.filter((e) => e.data?.relType !== 'SPOUSE_OF');

  // Add all nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  // Add parent-child edges (these determine rank)
  parentEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // For spouse edges, we add them with minlen=0 to keep spouses on the same rank
  spouseEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, { minlen: 0, weight: 2 });
  });

  // Run the dagre layout
  dagre.layout(dagreGraph);

  // Map the computed positions back to React Flow nodes
  const layoutedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    if (!dagreNode) return node;

    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - NODE_HEIGHT / 2,
      },
      // Prevent React Flow from animating the initial layout
      targetPosition: direction === 'TB' ? 'top' : 'left',
      sourcePosition: direction === 'TB' ? 'bottom' : 'right',
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Converts backend tree data into React Flow nodes and edges.
 * Backend format:
 *   { people: [{id, full_name, gender, birth_year, ...}], relationships: [{id, from_person_id, to_person_id, rel_type}] }
 * Returns:
 *   { nodes: [{id, type, data, position}], edges: [{id, source, target, type, data}] }
 */
export function treeDataToFlowElements(treeData, highlightPath = null) {
  const pathNodeIds = highlightPath ? new Set(highlightPath.path_node_ids || []) : new Set();
  const pathEdgeIds = highlightPath ? new Set(highlightPath.path_edge_ids || []) : new Set();

  const nodes = (treeData.people || []).map((person) => ({
    id: String(person.id),
    type: 'personNode',
    position: { x: 0, y: 0 },
    data: {
      ...person,
      isOnPath: pathNodeIds.has(person.id),
      isHighlighted: pathNodeIds.size === 0 || pathNodeIds.has(person.id),
      kinshipLabel: person.kinship_label || null,
    },
  }));

  const edges = (treeData.relationships || []).map((rel) => {
    const isSpouse = rel.rel_type === 'SPOUSE_OF';
    return {
      id: String(rel.id),
      source: String(rel.from_person_id),
      target: String(rel.to_person_id),
      type: isSpouse ? 'spouseEdge' : 'parentEdge',
      animated: pathEdgeIds.has(rel.id),
      data: {
        relType: rel.rel_type,
        isOnPath: pathEdgeIds.has(rel.id),
      },
      style: pathEdgeIds.has(rel.id)
        ? { stroke: '#f59e0b', strokeWidth: 4 }
        : undefined,
    };
  });

  return getLayoutedElements(nodes, edges);
}

