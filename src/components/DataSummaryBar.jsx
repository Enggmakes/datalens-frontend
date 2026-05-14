import { FileSpreadsheet, Database, Hash, Sigma, Type, Calendar, Activity, Download, Loader2 } from 'lucide-react';
import { getDownloadUrl } from '../api';
import { useState } from 'react';

const DOMAIN_COLORS = {
  Healthcare: 'badge-green',
  Education: 'badge-blue',
  'Sales & Business': 'badge-orange',
  Finance: 'badge-cyan',
  'HR & Workforce': 'badge-purple',
  Geospatial: 'badge-cyan',
  General: 'badge-purple',
};

export default function DataSummaryBar({ filename, rows, columns, colTypes, domain, onReset, sessionId }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!sessionId) return;
    setIsDownloading(true);
    try {
      const response = await fetch(getDownloadUrl(sessionId));
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datalens_${filename || 'export'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file. Please try uploading again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const numericCount = Object.values(colTypes).filter(t => t === 'numeric').length;
  const categoricalCount = Object.values(colTypes).filter(t => t === 'categorical').length;
  const datetimeCount = Object.values(colTypes).filter(t => t === 'datetime').length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      flexWrap: 'wrap',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileSpreadsheet size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename}</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 2 }}>
            <span className={`badge ${DOMAIN_COLORS[domain] || 'badge-purple'}`}>
              <Activity size={10} /> {domain}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Stat icon={Database} label="Rows" value={rows?.toLocaleString()} color="var(--primary)" />
        <Stat icon={Hash} label="Columns" value={columns?.length} color="var(--secondary)" />
        <Stat icon={Sigma} label="Numeric" value={numericCount} color="var(--success)" />
        <Stat icon={Type} label="Categorical" value={categoricalCount} color="var(--warning)" />
        {datetimeCount > 0 && <Stat icon={Calendar} label="Datetime" value={datetimeCount} color="var(--info)" />}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
        <button 
          onClick={handleDownload}
          className="btn btn-primary" 
          disabled={isDownloading || !sessionId}
          title="Download dataset as CSV"
        >
          {isDownloading ? <Loader2 size={16} className="spin" /> : <Download size={16} />} 
          Download CSV
        </button>
        <button className="btn btn-ghost" onClick={onReset} id="reset-upload-btn">
          Upload New File
        </button>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
        <Icon size={12} color={color} />
        <span className="stat-value" style={{ fontSize: '1.1rem', color }}>{value}</span>
      </div>
      <div className="stat-label" style={{ fontSize: '0.65rem' }}>{label}</div>
    </div>
  );
}
