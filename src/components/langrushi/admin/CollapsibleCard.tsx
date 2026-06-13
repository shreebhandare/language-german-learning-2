import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleCardProps {
  /** Optional key for identifying the card */
  cardKey?: string;
  /** Header label (shown in monospace caps) */
  label: string;
  /** Optional badge/node shown next to the label */
  badge?: React.ReactNode;
  /** Card body content */
  children: React.ReactNode;
  /** If true, card starts collapsed */
  defaultCollapsed?: boolean;
  /** Extra className on the outer wrapper */
  className?: string;
  /** Extra style on the outer wrapper */
  style?: React.CSSProperties;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  label, badge, children, defaultCollapsed = false, className = '', style,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`card mb-6 ${className}`} style={{ overflow: 'hidden', ...style }}>
      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: '#2c3e50',
          border: 'none',
          borderBottom: collapsed ? 'none' : '1px solid #34495e',
          cursor: 'pointer',
          gap: '10px',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#34495e')}
        onMouseLeave={e => (e.currentTarget.style.background = '#2c3e50')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#f8fafc',
          }}>
            {label}
          </span>
          {badge}
        </div>
        <ChevronDown
          className="w-4 h-4"
          style={{
            color: '#cbd5e1',
            flexShrink: 0,
            transition: 'transform 200ms ease',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* ── Body ── */}
      {!collapsed && (
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleCard;
