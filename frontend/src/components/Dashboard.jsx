import React, { useState } from 'react';
import ChartSuggestions from './ChartSuggestions';
import ChartRenderer from './ChartRenderer';
import StatisticsPanel from './StatisticsPanel';
import CustomChartBuilder from './CustomChartBuilder';
import DataPreview from './DataPreview';
import DataSummaryBar from './DataSummaryBar';
import { LayoutDashboard, BarChart2, Sliders, Table2, TrendingUp } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'charts', label: 'AI Charts', icon: BarChart2 },
  { id: 'custom', label: 'Custom Builder', icon: Sliders },
  { id: 'stats', label: 'Statistics', icon: TrendingUp },
  { id: 'data', label: 'Raw Data', icon: Table2 },
];

function KPICard({ title, value, subtitle, color }) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="nm-accent-dot" style={{ width: 90, height: 90, top: -30, right: -30, background: `${color}18` }} />
      <div className="stat-label">{title}</div>
      <div className="stat-value" style={{ color, margin: '0.4rem 0' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{subtitle}</div>}
    </div>
  );
}

function CorrelationBadge({ col1, col2, val }) {
  const abs = Math.abs(val);
  let strength = 'Weak';
  let color = 'var(--text-muted)';
  if (abs > 0.7) { strength = 'Strong'; color = val > 0 ? 'var(--success)' : 'var(--danger)'; }
  else if (abs > 0.4) { strength = 'Moderate'; color = val > 0 ? 'var(--warning)' : 'var(--accent)'; }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.45rem 0',
      borderBottom: '1px solid var(--border-inner)',
      fontSize: '0.78rem',
    }}>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
        {col1} <span style={{ color: 'var(--text-muted)' }}>↔</span> {col2}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color, fontFamily: 'Fira Code', fontWeight: 700 }}>{val?.toFixed(3)}</span>
        <span style={{
          fontSize: '0.65rem', color,
          background: `${color}20`,
          padding: '0.1rem 0.45rem',
          borderRadius: 6,
          fontWeight: 700,
        }}>{strength}</span>
      </div>
    </div>
  );
}

export default function Dashboard({ analysisData, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(0);
  const [activeSuggestion, setActiveSuggestion] = useState(analysisData.chart_suggestions[0] || null);

  const { session_id, filename, rows, columns, col_types, statistics, chart_suggestions, correlations, domain, preview } = analysisData;

  const numericCols = columns.filter(c => col_types[c] === 'numeric');
  const categoricalCols = columns.filter(c => col_types[c] === 'categorical');
  const nullCount = Object.values(statistics).reduce((sum, s) => sum + (s.null_count || 0), 0);
  const completeness = (((rows * columns.length - nullCount) / (rows * columns.length)) * 100).toFixed(1);

  const topCorrelations = [];
  if (correlations) {
    const cols = Object.keys(correlations);
    for (let i = 0; i < cols.length; i++) {
      for (let j = i + 1; j < cols.length; j++) {
        const val = correlations[cols[i]][cols[j]];
        if (val !== null && Math.abs(val) < 1) {
          topCorrelations.push({ col1: cols[i], col2: cols[j], val });
        }
      }
    }
    topCorrelations.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
  }

  return (
    <div className="fade-in">
      <DataSummaryBar
        filename={filename} rows={rows} columns={columns}
        colTypes={col_types} domain={domain} onReset={onReset}
      />

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              <Icon size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="fade-in">
          <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
            <KPICard title="Total Records" value={rows?.toLocaleString()} subtitle="Data points" color="var(--accent)" />
            <KPICard title="Features" value={columns?.length} subtitle={`${numericCols.length} numeric, ${categoricalCols.length} categorical`} color="var(--accent-light)" />
            <KPICard title="Data Quality" value={`${completeness}%`} subtitle="Completeness score" color={completeness > 90 ? 'var(--success)' : 'var(--warning)'} />
            <KPICard title="Missing Values" value={nullCount?.toLocaleString()} subtitle="Across all columns" color={nullCount > 0 ? 'var(--danger)' : 'var(--success)'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {chart_suggestions[0] && (
              <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{chart_suggestions[0].title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 500 }}>{chart_suggestions[0].description}</p>
                <ChartRenderer suggestion={chart_suggestions[0]} sessionId={session_id} />
              </div>
            )}
            {chart_suggestions[1] && (
              <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{chart_suggestions[1].title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 500 }}>{chart_suggestions[1].description}</p>
                <ChartRenderer suggestion={chart_suggestions[1]} sessionId={session_id} />
              </div>
            )}
          </div>

          {topCorrelations.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Top Feature Correlations</h3>
              <div style={{ columns: 2, gap: '1.5rem' }}>
                {topCorrelations.slice(0, 10).map((c, i) => (
                  <CorrelationBadge key={i} col1={c.col1} col2={c.col2} val={c.val} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI CHARTS TAB */}
      {activeTab === 'charts' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 20 }}>
            <ChartSuggestions
              suggestions={chart_suggestions}
              onSelect={(s, i) => { setActiveSuggestion(s); setSelectedSuggestionIdx(i); }}
              selectedIndex={selectedSuggestionIdx}
            />
          </div>
          <div className="card">
            {activeSuggestion ? (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{activeSuggestion.title}</h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{activeSuggestion.description}</p>
                </div>
                <ChartRenderer suggestion={activeSuggestion} sessionId={session_id} />
              </>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.5rem' }}>
                <BarChart2 size={40} strokeWidth={1} />
                <p style={{ fontWeight: 600 }}>Select a chart from the left panel</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOM BUILDER TAB */}
      {activeTab === 'custom' && (
        <div className="card fade-in">
          <CustomChartBuilder sessionId={session_id} columns={columns} colTypes={col_types} />
        </div>
      )}

      {/* STATISTICS TAB */}
      {activeTab === 'stats' && (
        <div className="card fade-in">
          <StatisticsPanel statistics={statistics} colTypes={col_types} columns={columns} />
        </div>
      )}

      {/* RAW DATA TAB */}
      {activeTab === 'data' && (
        <div className="card fade-in">
          <DataPreview data={preview} columns={columns} />
        </div>
      )}
    </div>
  );
}
