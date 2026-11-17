import { useState, useCallback, useRef } from 'react';
import { getTree as fetchTreeApi } from '../api/client';
import { treeDataToFlowElements, getLayoutedElements } from '../utils/layout';

/**
 * Hook to manage the interactive family tree state.
 */
export function useTree() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rawDataRef = useRef({ people: [], relationships: [] });

  const fetchTree = useCallback(async (personId, depth = 2) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTreeApi(personId, depth);
      const treeData = res.data;
      rawDataRef.current = treeData;
      const { nodes: layoutedNodes, edges: layoutedEdges } = treeDataToFlowElements(treeData);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      return treeData;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load family tree');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const expandBranch = useCallback(
    async (nodeId) => {
      setLoading(true);
      try {
        const res = await fetchTreeApi(nodeId, 1);
        const newData = res.data;

        // Merge new people and relationships with existing data
        const existingPeopleIds = new Set(rawDataRef.current.people.map((p) => p.id));
        const existingRelIds = new Set(rawDataRef.current.relationships.map((r) => r.id));

        const mergedPeople = [
          ...rawDataRef.current.people,
          ...(newData.people || []).filter((p) => !existingPeopleIds.has(p.id)),
        ];
        const mergedRels = [
          ...rawDataRef.current.relationships,
          ...(newData.relationships || []).filter((r) => !existingRelIds.has(r.id)),
        ];

        const mergedData = { people: mergedPeople, relationships: mergedRels };
        rawDataRef.current = mergedData;

        const { nodes: layoutedNodes, edges: layoutedEdges } = treeDataToFlowElements(mergedData);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        return mergedData;
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to expand branch');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addNode = useCallback(
    (person, relationship) => {
      // Optimistically add a new person node
      const newNode = {
        id: String(person.id),
        type: 'personNode',
        position: { x: 0, y: 0 },
        data: { ...person, isHighlighted: true },
      };

      const newEdge = relationship
        ? {
            id: String(relationship.id),
            source: String(relationship.from_person_id),
            target: String(relationship.to_person_id),
            type: relationship.rel_type === 'SPOUSE_OF' ? 'spouseEdge' : 'parentEdge',
            data: { relType: relationship.rel_type },
          }
        : null;

      setNodes((prev) => {
        const updated = [...prev, newNode];
        const updatedEdges = newEdge ? [...edges, newEdge] : edges;
        const { nodes: layouted } = getLayoutedElements(updated, updatedEdges);
        return layouted;
      });

      if (newEdge) {
        setEdges((prev) => {
          const updated = [...prev, newEdge];
          return updated;
        });
      }

      // Update raw data ref
      rawDataRef.current.people.push(person);
      if (relationship) {
        rawDataRef.current.relationships.push(relationship);
      }
    },
    [edges]
  );

  const highlightPath = useCallback(
    (pathData) => {
      if (!pathData) {
        // Reset highlight
        const { nodes: layoutedNodes, edges: layoutedEdges } = treeDataToFlowElements(
          rawDataRef.current
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        return;
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } = treeDataToFlowElements(
        rawDataRef.current,
        pathData
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    },
    []
  );

  return {
    nodes,
    edges,
    selectedNode,
    loading,
    error,
    setNodes,
    setEdges,
    setSelectedNode,
    fetchTree,
    expandBranch,
    addNode,
    highlightPath,
  };
}

