import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Hash, Type, Calendar, Sigma } from 'lucide-react';

const TYPE_ICONS = { numeric: Sigma, categorical: Type, datetime: Calendar, text: Hash };
const TYPE_COLORS = { numeric: 'badge-blue', categorical: 'badge-green', datetime: 'badge-cyan', text: 'badge-purple' };

function StatRow({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontFamily: 'Fira Code', fontSize: '0.78rem', fontWeight: 500 }}>
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(value)}
      </span>
    </div>
  );
}

function ColumnCard({ col, stats, colType }) {
  const [open, setOpen] = useState(false);
  const Icon = TYPE_ICONS[colType] || Hash;
  const badgeClass = TYPE_COLORS[colType] || 'badge-purple';
  const nullPct = stats?.null_count ? `${stats.null_count} nulls` : 'No nulls';

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      transition: 'all var(--transition)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.7rem 0.9rem', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
        }}
        aria-expanded={open}
        id={`col-card-${col.replace(/\s/g, '-')}`}
      >
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color="var(--primary)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{nullPct}</div>
        </div>
        <span className={`badge ${badgeClass}`}>{colType}</span>
        {open ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>

      {open && (
        <div style={{ padding: '0 0.9rem 0.8rem', borderTop: '1px solid var(--border)' }} className="fade-in">
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
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 60, height: 4, background: 'var(--bg-base)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${(v / Math.max(...Object.values(stats.top_values))) * 100}%`, background: 'var(--primary)', borderRadius: 2 }} />
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'Fira Code', fontSize: '0.72rem' }}>{v}</span>
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
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontFamily: 'Fira Code' }}>
        Column Statistics ({columns.length} columns)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
