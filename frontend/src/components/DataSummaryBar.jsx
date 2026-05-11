import React from 'react';
import { FileSpreadsheet, Database, Hash, Sigma, Type, Calendar, Activity } from 'lucide-react';

const DOMAIN_COLORS = {
  Healthcare: 'badge-green',
  Education: 'badge-blue',
  'Sales & Business': 'badge-orange',
  Finance: 'badge-cyan',
  'HR & Workforce': 'badge-purple',
  Geospatial: 'badge-cyan',
  General: 'badge-purple',
};

export default function DataSummaryBar({ filename, rows, columns, colTypes, domain, onReset }) {
  const numericCount = Object.values(colTypes).filter(t => t === 'numeric').length;
  const categoricalCount = Object.values(colTypes).filter(t => t === 'categorical').length;
  const datetimeCount = Object.values(colTypes).filter(t => t === 'datetime').length;

  return (
    <div style={{
      background: 'var(--nm-bg)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--nm-raised)',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      flexWrap: 'wrap',
      marginBottom: '1.75rem',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-sm)',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-raised-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <FileSpreadsheet size={20} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
            {filename}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 4 }}>
            <span className={`badge ${DOMAIN_COLORS[domain] || 'badge-purple'}`}>
              <Activity size={10} /> {domain}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Stat icon={Database} label="Rows" value={rows?.toLocaleString()} color="var(--accent)" />
        <Stat icon={Hash} label="Columns" value={columns?.length} color="var(--accent-light)" />
        <Stat icon={Sigma} label="Numeric" value={numericCount} color="var(--success)" />
        <Stat icon={Type} label="Categorical" value={categoricalCount} color="var(--warning)" />
        {datetimeCount > 0 && <Stat icon={Calendar} label="Datetime" value={datetimeCount} color="var(--info)" />}
      </div>

      <button className="btn btn-ghost" onClick={onReset} id="reset-upload-btn" style={{ flexShrink: 0 }}>
        Upload New File
      </button>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
        <Icon size={12} color={color} />
        <span className="stat-value" style={{ fontSize: '1.1rem', color }}>{value}</span>
      </div>
      <div className="stat-label" style={{ fontSize: '0.65rem' }}>{label}</div>
    </div>
  );
}
