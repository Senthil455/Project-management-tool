import React from 'react';
import { getType, getPriority } from '../constants';

export const TypeIcon = ({ type, size = 16 }) => {
  const t = getType(type);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-label={t.label}>
      {type === 'bug' ? (
        <circle cx="8" cy="8" r="6.5" fill={t.color} />
      ) : (
        <path d="M8 1.5 L14.5 8 L8 14.5 L1.5 8 Z" fill={t.color} />
      )}
    </svg>
  );
};

export const PriorityFlag = ({ priority, size = 16 }) => {
  const p = getPriority(priority);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-label={`${p.label} priority`}>
      <path
        d="M3 1 L3 15 M3 3 L13 3 L11 5.5 L13 8 L3 8"
        fill="none"
        stroke={p.color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const PriorityArrow = ({ priority, size = 16 }) => {
  const p = getPriority(priority);
  const level = ['highest', 'high', 'medium', 'low', 'lowest'].indexOf(priority);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-label={`${p.label} priority`}>
      <path
        d={`M8 2 L14 9 L8 9 L8 14 L2 14 L2 9 L8 9`}
        fill="none"
        stroke={p.color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ICONS = {
  board: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  backlog: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
