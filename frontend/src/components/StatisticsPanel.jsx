import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Hash, Type, Calendar, Sigma } from 'lucide-react';

const TYPE_ICONS = { numeric: Sigma, categorical: Type, datetime: Calendar, text: Hash };
const TYPE_COLORS = { numeric: 'badge-blue', categorical: 'badge-green', datetime: 'badge-cyan', text: 'badge-purple' };
const TYPE_ACCENT = { numeric: 'var(--accent)', categorical: 'var(--success)', datetime: 'var(--info)', text: 'var(--warning)' };

function StatRow({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '0.35rem 0',
      borderBottom: '1px solid var(--border-inner)',
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontFamily: 'Fira Code', fontSize: '0.78rem', fontWeight: 600 }}>
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(value)}
      </span>
    </div>
  );
}

function ColumnCard({ col, stats, colType }) {
  const [open, setOpen] = useState(false);
  const Icon = TYPE_ICONS[colType] || Hash;
  const badgeClass = TYPE_COLORS[colType] || 'badge-purple';
  const accentColor = TYPE_ACCENT[colType] || 'var(--accent)';
  const nullPct = stats?.null_count ? `${stats.null_count} nulls` : 'No nulls';

  return (
    <div style={{
      background: 'var(--nm-bg)',
      borderRadius: 'var(--radius-md)',
      boxShadow: open ? 'var(--nm-inset)' : 'var(--nm-raised-sm)',
      overflow: 'hidden',
      transition: 'all var(--transition)',
      border: '1px solid var(--border)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
        }}
        aria-expanded={open}
        id={`col-card-${col.replace(/\s/g, '-')}`}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-raised-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={15} color={accentColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
            {col}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{nullPct}</div>
        </div>
        <span className={`badge ${badgeClass}`}>{colType}</span>
        {open ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>

      {open && (
        <div style={{
          padding: '0.75rem 1rem 0.9rem',
          borderTop: '1px solid var(--border-inner)',
          background: 'var(--nm-surface)',
          boxShadow: 'var(--nm-inset)',
        }} className="fade-in">
          {colType === 'numeric' && (
            <>
              <StatRow label="Mean" value={stats.mean} />
              <StatRow label="Median" value={stats.median} />
              <StatRow label="Std Dev" value={stats.std} />
              <StatRow label="Min" value={stats.min} />
              <StatRow label="Max" value={stats.max} />
              <StatRow label="Q1 (25%)" value={stats.q1} />
              <StatRow label="Q3 (75%)" value={stats.q3} />
              <StatRow label="Skewness" value={stats.skewness?.toFixed(4)} />
              <StatRow label="Kurtosis" value={stats.kurtosis?.toFixed(4)} />
            </>
          )}
          {colType === 'categorical' && (
            <>
              <StatRow label="Unique Values" value={stats.unique_count} />
              {stats.top_values && Object.entries(stats.top_values).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid var(--border-inner)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 500, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 60, height: 5, background: 'var(--nm-bg)', borderRadius: 3, boxShadow: 'var(--nm-inset)' }}>
                      <div style={{ height: '100%', width: `${(v / Math.max(...Object.values(stats.top_values))) * 100}%`, background: accentColor, borderRadius: 3 }} />
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'Fira Code', fontSize: '0.72rem', fontWeight: 600 }}>{v}</span>
                  </div>
                </div>
              ))}
            </>
          )}
          {colType === 'datetime' && (
            <>
              <StatRow label="Start" value={stats.min} />
              <StatRow label="End" value={stats.max} />
            </>
          )}
          <StatRow label="Null Count" value={stats.null_count} />
        </div>
      )}
    </div>
  );
}

export default function StatisticsPanel({ statistics, colTypes, columns }) {
  return (
    <div>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.1rem', fontFamily: 'Fira Code', fontWeight: 700 }}>
        Column Statistics ({columns.length} columns)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {columns.map(col => (
          <ColumnCard
            key={col}
            col={col}
            stats={statistics[col]}
            colType={colTypes[col]}
          />
        ))}
      </div>
    </div>
  );
}
