import React, { useState } from 'react';
import { getCustomChartData } from '../api';
import ChartRenderer from './ChartRenderer';
import { Sliders, RefreshCw, Play } from 'lucide-react';

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'histogram', label: 'Histogram' },
  { value: 'heatmap', label: 'Correlation Heatmap' },
  { value: 'box', label: 'Box Plot' },
];

const AGGREGATIONS = [
  { value: 'mean', label: 'Mean (Average)' },
  { value: 'sum', label: 'Sum (Total)' },
  { value: 'count', label: 'Count' },
  { value: 'max', label: 'Maximum' },
  { value: 'min', label: 'Minimum' },
];

export default function CustomChartBuilder({ sessionId, columns, colTypes }) {
  const [chartType, setChartType] = useState('bar');
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [aggregation, setAggregation] = useState('mean');
  const [bins, setBins] = useState(20);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const numericCols = columns.filter(c => colTypes[c] === 'numeric');
  const categoricalCols = columns.filter(c => colTypes[c] === 'categorical');
  const datetimeCols = columns.filter(c => colTypes[c] === 'datetime');

  const needsY = !['histogram', 'heatmap', 'box', 'pie'].includes(chartType);
  const needsX = chartType !== 'heatmap';

  const handleBuild = () => {
    if (!sessionId) return;
    setConfig({
      type: chartType,
      x: xCol || null,
      y: yCol || null,
      bins,
      aggregation,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Sliders size={18} color="var(--accent)" />
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Custom Chart Builder</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="chart-type-select">Chart Type</label>
          <select id="chart-type-select" value={chartType} onChange={e => setChartType(e.target.value)}>
            {CHART_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
          </select>
        </div>

        {needsX && (
          <div>
            <label htmlFor="x-col-select">X Axis / Category</label>
            <select id="x-col-select" value={xCol} onChange={e => setXCol(e.target.value)}>
              <option value="">— Select Column —</option>
              <optgroup label="Categorical">
                {categoricalCols.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
              <optgroup label="Numeric">
                {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
              <optgroup label="Date/Time">
                {datetimeCols.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            </select>
          </div>
        )}

        {needsY && (
          <div>
            <label htmlFor="y-col-select">Y Axis / Value</label>
            <select id="y-col-select" value={yCol} onChange={e => setYCol(e.target.value)}>
              <option value="">— Select Column —</option>
              {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {chartType === 'bar' && (
          <div>
            <label htmlFor="aggregation-select">Aggregation</label>
            <select id="aggregation-select" value={aggregation} onChange={e => setAggregation(e.target.value)}>
              {AGGREGATIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
        )}

        {chartType === 'histogram' && (
          <div>
            <label htmlFor="bins-input">Number of Bins: {bins}</label>
            <input id="bins-input" type="range" min={5} max={60} value={bins} onChange={e => setBins(Number(e.target.value))}
              style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
          </div>
        )}
      </div>

      <button className="btn btn-accent" onClick={handleBuild} id="build-chart-btn"
        disabled={!sessionId || (needsX && !xCol) || (needsY && !yCol)}
        style={{ marginBottom: '1.5rem' }}>
        <Play size={16} /> Generate Chart
      </button>

      {config && (
        <div className="fade-in">
          <ChartRenderer suggestion={config} sessionId={sessionId} />
        </div>
      )}
    </div>
  );
}
