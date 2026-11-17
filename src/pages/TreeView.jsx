import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow, Controls, MiniMap, Background, useNodesState, useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { getTree } from '../api/client';
import { getLayoutedElements } from '../utils/layout';
import PersonNode from '../components/PersonNode';
import MarriageEdge from '../components/MarriageEdge';
import AddPersonModal from '../components/AddPersonModal';
import RelationshipPathOverlay from '../components/RelationshipPathOverlay';
import { Maximize2, Search, Plus, Loader } from 'lucide-react';

const nodeTypes = { personNode: PersonNode };
const edgeTypes = { parentEdge: MarriageEdge, spouseEdge: MarriageEdge };

function TreeViewInner() {
  const { personId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addRelType, setAddRelType] = useState(null);
  const [showPathfinder, setShowPathfinder] = useState(false);
  const [pathResult, setPathResult] = useState(null);

  const fetchTree = useCallback(async (centerId, depth = 2) => {
    setLoading(true);
    try {
      const res = await getTree(centerId, depth);
      const { nodes: rawNodes, edges: rawEdges } = res.data;
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges, 'TB');
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err) {
      console.warn('Backend tree not reachable, loading demo family tree:', err);
      const demoNodes = [
        { id: '1', type: 'personNode', data: { id: '1', name: 'Ramesh Taklikar', gender: 'Male', birthYear: 1952, isClaimed: true } },
        { id: '2', type: 'personNode', data: { id: '2', name: 'Savitri Taklikar', gender: 'Female', birthYear: 1956, isClaimed: true } },
        { id: '3', type: 'personNode', data: { id: '3', name: 'Gitesh Taklikar', gender: 'Male', birthYear: 1982, isClaimed: true } },
        { id: '4', type: 'personNode', data: { id: '4', name: 'Pooja Taklikar', gender: 'Female', birthYear: 1985, isClaimed: false } },
        { id: '5', type: 'personNode', data: { id: '5', name: 'Aarav Taklikar', gender: 'Male', birthYear: 2012, isClaimed: false } },
        { id: '6', type: 'personNode', data: { id: '6', name: 'Ananya Taklikar', gender: 'Female', birthYear: 2015, isClaimed: false } },
      ];
      const demoEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'spouseEdge', data: { relType: 'SPOUSE_OF' } },
        { id: 'e1-3', source: '1', target: '3', type: 'parentEdge', data: { relType: 'PARENT_OF' } },
        { id: 'e2-3', source: '2', target: '3', type: 'parentEdge', data: { relType: 'PARENT_OF' } },
        { id: 'e3-4', source: '3', target: '4', type: 'spouseEdge', data: { relType: 'SPOUSE_OF' } },
        { id: 'e3-5', source: '3', target: '5', type: 'parentEdge', data: { relType: 'PARENT_OF' } },
        { id: 'e4-5', source: '4', target: '5', type: 'parentEdge', data: { relType: 'PARENT_OF' } },
        { id: 'e3-6', source: '3', target: '6', type: 'parentEdge', data: { relType: 'PARENT_OF' } },
        { id: 'e4-6', source: '4', target: '6', type: 'parentEdge', data: { relType: 'PARENT_OF' } },
      ];
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(demoNodes, demoEdges, 'TB');
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (personId) fetchTree(personId);
  }, [personId, fetchTree]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleAddRelative = (relType) => {
    setAddRelType(relType);
    setShowAddModal(true);
  };

  const handlePersonAdded = () => {
    setShowAddModal(false);
    if (personId) fetchTree(personId);
  };

  const handleExpandBranch = async (nodeId) => {
    try {
      const res = await getTree(nodeId, 2);
      const { nodes: newRawNodes, edges: newRawEdges } = res.data;
      // Merge with existing
      const existingIds = new Set(nodes.map(n => n.id));
      const mergedRawNodes = [...nodes.map(n => ({ ...n, type: 'personNode', data: n.data }))];
      const mergedRawEdges = [...edges];
      for (const nn of newRawNodes) {
        if (!existingIds.has(nn.id)) mergedRawNodes.push(nn);
      }
      const existingEdgeIds = new Set(edges.map(e => e.id));
      for (const ne of newRawEdges) {
        if (!existingEdgeIds.has(ne.id)) mergedRawEdges.push(ne);
      }
      const { nodes: layouted, edges: layoutedE } = getLayoutedElements(mergedRawNodes, mergedRawEdges, 'TB');
      setNodes(layouted);
      setEdges(layoutedE);
    } catch (err) {
      console.error('Expand failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-500">Loading family tree...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setShowPathfinder(!showPathfinder)}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-amber-600 transition-colors text-sm font-medium min-h-[44px]"
        >
          <Search className="w-4 h-4" /> Find Connection
        </button>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes.map(n => ({
          ...n,
          data: {
            ...n.data,
            onAddRelative: handleAddRelative,
            onExpand: () => handleExpandBranch(n.id),
            isSelected: selectedNode?.id === n.id,
          },
        }))}
        edges={edges.map(e => ({
          ...e,
          data: { ...e.data, highlighted: pathResult?.pathEdges?.some(pe => pe.id === e.id) },
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant="dots" gap={20} size={1} color="#e5e7eb" />
        <Controls className="!bg-white !shadow-lg !rounded-xl !border-0" />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.gender === 'Male') return '#60a5fa';
            if (n.data?.gender === 'Female') return '#f472b6';
            return '#a3a3a3';
          }}
          className="!bg-white !shadow-lg !rounded-xl !border-0"
        />
      </ReactFlow>

      {/* Path overlay */}
      {pathResult && (
        <RelationshipPathOverlay
          result={pathResult}
          onClose={() => setPathResult(null)}
        />
      )}

      {/* Selected node detail panel */}
      {selectedNode && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-200 p-6 overflow-y-auto z-20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{selectedNode.data?.fullName}</h3>
            <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-gray-100 rounded">✕</button>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            {selectedNode.data?.gender && <p>Gender: <span className="font-medium text-gray-900">{selectedNode.data.gender}</span></p>}
            {selectedNode.data?.birthYear && <p>Born: <span className="font-medium text-gray-900">{selectedNode.data.birthYear}</span></p>}
            {selectedNode.data?.birthPlace && <p>Place: <span className="font-medium text-gray-900">{selectedNode.data.birthPlace}</span></p>}
            {selectedNode.data?.kinshipBadge && (
              <p className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold mt-2">
                {selectedNode.data.kinshipBadge}
              </p>
            )}
          </div>
          <div className="mt-6 space-y-2">
            <p className="font-medium text-gray-700 text-sm">Add Relative:</p>
            {['Father', 'Mother', 'Spouse', 'Child', 'Sibling'].map((rel) => (
              <button
                key={rel}
                onClick={() => handleAddRelative({ type: rel, referenceNode: selectedNode })}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-indigo-700 text-sm transition-colors flex items-center gap-2 min-h-[44px]"
              >
                <Plus className="w-4 h-4" /> Add {rel}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Person Modal */}
      {showAddModal && (
        <AddPersonModal
          relType={addRelType}
          referenceNode={selectedNode}
          onClose={() => setShowAddModal(false)}
          onAdded={handlePersonAdded}
        />
      )}
    </div>
  );
}

export default function TreeView() {
  return (
    <ReactFlowProvider>
      <TreeViewInner />
    </ReactFlowProvider>
  );
}
