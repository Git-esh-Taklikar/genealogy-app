import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn, getInitials, formatBirthYear, getGenderLabel, getGenderColor } from '../utils/helpers';
import PrivacyBadge from './PrivacyBadge';
import { Plus, Pencil, ChevronDown } from 'lucide-react';

const addOptions = [
  { label: 'Father', relType: 'PARENT_OF', gender: 'M', direction: 'parent' },
  { label: 'Mother', relType: 'PARENT_OF', gender: 'F', direction: 'parent' },
  { label: 'Spouse', relType: 'SPOUSE_OF', gender: null, direction: 'spouse' },
  { label: 'Child', relType: 'PARENT_OF', gender: null, direction: 'child' },
  { label: 'Sibling', relType: 'SIBLING', gender: null, direction: 'sibling' },
];

function PersonNode({ data, selected }) {
  const [showActions, setShowActions] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const {
    full_name,
    gender,
    birth_year,
    date_of_birth,
    photo_url,
    is_alive,
    privacy,
    kinshipLabel,
    isOnPath,
    isHighlighted,
    is_masked,
    onAddRelative,
    onEditPerson,
    isKiosk,
  } = data;

  const initials = getInitials(full_name);
  const yearDisplay = formatBirthYear(birth_year, date_of_birth);
  const genderIcon = getGenderLabel(gender);
  const genderColorClass = getGenderColor(gender);
  const dimmed = isHighlighted === false;

  const handleAddClick = (option) => {
    setShowAddMenu(false);
    if (onAddRelative) {
      onAddRelative({
        relType: option.relType,
        direction: option.direction,
        prefilledGender: option.gender,
        contextPersonId: data.id,
        contextPersonName: full_name,
      });
    }
  };

  if (is_masked) {
    return (
      <div className="person-card bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 min-w-[200px] text-center opacity-70">
        <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-2">
          <span className="text-gray-500 text-lg">?</span>
        </div>
        <p className="text-sm font-medium text-gray-500">Private Relative</p>
        {privacy && <PrivacyBadge level={privacy} className="mt-1" />}
        <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
        <Handle type="source" position={Position.Right} id="spouse-right" className="!bg-gray-400 !w-2 !h-2" />
        <Handle type="target" position={Position.Left} id="spouse-left" className="!bg-gray-400 !w-2 !h-2" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'person-card bg-white border rounded-xl px-4 py-3 min-w-[200px] transition-all duration-300 group relative',
        selected ? 'border-brand-500 shadow-lg ring-2 ring-brand-300' : 'border-warm-200 shadow-sm',
        isOnPath && 'path-node-pulse border-brand-500 shadow-brand-200 shadow-lg',
        dimmed && 'opacity-30'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowAddMenu(false);
      }}
      onFocus={() => setShowActions(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setShowActions(false);
          setShowAddMenu(false);
        }
      }}
    >
      {/* Parent handle (top) */}
      <Handle type="target" position={Position.Top} className="!bg-accent-500 !w-3 !h-3 !border-2 !border-white" />

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photo_url ? (
            <img
              src={photo_url}
              alt={full_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-warm-200"
            />
          ) : (
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-base font-bold border-2 border-warm-200',
                gender?.toUpperCase() === 'M' || gender?.toUpperCase() === 'MALE'
                  ? 'bg-blue-50 text-blue-700'
                  : gender?.toUpperCase() === 'F' || gender?.toUpperCase() === 'FEMALE'
                  ? 'bg-pink-50 text-pink-700'
                  : 'bg-warm-100 text-warm-700'
              )}
            >
              {initials}
            </div>
          )}
          {/* Gender indicator */}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-white',
              genderColorClass
            )}
          >
            {genderIcon}
          </span>
        </div>

        {/* Name & details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{full_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {yearDisplay && <span className="text-xs text-gray-500">b. {yearDisplay}</span>}
            {is_alive === false && (
              <span className="text-xs text-gray-400 italic">deceased</span>
            )}
          </div>
          {kinshipLabel && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 text-brand-800 leading-tight">
              {kinshipLabel}
            </span>
          )}
        </div>
      </div>

      {/* Quick actions (hover/focus) */}
      {!isKiosk && (showActions || selected) && (
        <div className="absolute -top-3 right-2 flex items-center gap-1 animate-fade-up">
          {/* Add relative */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddMenu(!showAddMenu);
              }}
              className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center shadow hover:bg-brand-600 transition-colors min-w-touch min-h-touch"
              style={{ minWidth: 28, minHeight: 28 }}
              aria-label="Add relative"
              title="Add relative"
            >
              <Plus size={14} />
            </button>
            {showAddMenu && (
              <div className="absolute right-0 top-9 w-40 bg-white rounded-lg shadow-lg border border-warm-200 py-1 z-30">
                {addOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddClick(opt);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-warm-50 transition-colors"
                  >
                    Add {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEditPerson) onEditPerson(data);
            }}
            className="w-7 h-7 rounded-full bg-accent-500 text-white flex items-center justify-center shadow hover:bg-accent-600 transition-colors"
            style={{ minWidth: 28, minHeight: 28 }}
            aria-label="Edit person"
            title="Edit person"
          >
            <Pencil size={12} />
          </button>
        </div>
      )}

      {/* Children handle (bottom) */}
      <Handle type="source" position={Position.Bottom} className="!bg-accent-500 !w-3 !h-3 !border-2 !border-white" />

      {/* Spouse handles (sides) */}
      <Handle
        type="source"
        position={Position.Right}
        id="spouse-right"
        className="!bg-brand-500 !w-2.5 !h-2.5 !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="spouse-left"
        className="!bg-brand-500 !w-2.5 !h-2.5 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(PersonNode);

