import React from 'react';
import {
  BarChart2, TrendingUp, PieChart, Activity, Grid3x3, BarChart,
  Dot, Layers
} from 'lucide-react';

const ICONS = {
  BarChart2, TrendingUp, PieChart, Activity, Grid: Grid3x3, BarChart,
  ScatterChart: Dot, BoxSelect: Layers
};

export default function ChartSuggestions({ suggestions, onSelect, selectedIndex }) {
  return (
    <div>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontFamily: 'Fira Code', fontWeight: 700 }}>
        AI-Suggested Visualizations
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {suggestions.map((s, i) => {
          const Icon = ICONS[s.icon] || BarChart2;
          const isSelected = selectedIndex === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(s, i)}
              className="btn btn-ghost"
              style={{
                justifyContent: 'flex-start',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--accent-soft)' : 'var(--nm-bg)',
                color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                width: '100%',
                textAlign: 'left',
                gap: '0.75rem',
                boxShadow: isSelected ? 'var(--nm-inset)' : 'var(--nm-raised-sm)',
                border: isSelected ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
              }}
              aria-pressed={isSelected}
              id={`suggestion-${i}`}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                background: 'var(--nm-bg)',
                boxShadow: isSelected ? 'var(--nm-inset)' : 'var(--nm-raised-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} color={isSelected ? 'var(--accent)' : 'var(--text-muted)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.1rem' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.description}
                </div>
              </div>
              <span className={`badge ${isSelected ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '0.6rem' }}>
                {s.type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
