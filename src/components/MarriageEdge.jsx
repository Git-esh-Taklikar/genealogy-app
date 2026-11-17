import React from 'react';
import { BaseEdge, getStraightPath, getBezierPath } from '@xyflow/react';
import { cn } from '../utils/helpers';
import { Heart } from 'lucide-react';

export default function MarriageEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) {
  const isOnPath = data?.isOnPath;

  // Use a straight horizontal path for spouse connections
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: isOnPath ? '#f59e0b' : '#d97706',
          strokeWidth: isOnPath ? 4 : 2,
          strokeDasharray: isOnPath ? '8 4' : 'none',
          filter: isOnPath ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))' : 'none',
          ...style,
        }}
        className={cn(isOnPath && 'path-glow-edge')}
      />
      {/* Heart/ring icon at midpoint */}
      <foreignObject
        width={24}
        height={24}
        x={labelX - 12}
        y={labelY - 12}
        className="pointer-events-none"
      >
        <div className="w-6 h-6 rounded-full bg-white border-2 border-brand-400 flex items-center justify-center shadow-sm">
          <Heart size={12} className="text-brand-500 fill-brand-500" />
        </div>
      </foreignObject>
    </>
  );
}

/**
 * Parent edge — vertical with an arrow, simpler than spouse edge.
 */
export function ParentEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) {
  const isOnPath = data?.isOnPath;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: isOnPath ? '#f59e0b' : '#6366f1',
        strokeWidth: isOnPath ? 4 : 2,
        filter: isOnPath ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))' : 'none',
        ...style,
      }}
    />
  );
}

