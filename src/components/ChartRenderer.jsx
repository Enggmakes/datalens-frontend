import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Label
} from 'recharts';
import { getChartData } from '../api';
import { AlertCircle, Loader2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F97316', '#EF4444', '#06B6D4', '#F59E0B', '#EC4899', '#84CC16', '#A78BFA'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
      {label !== undefined && <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 4 }}>{String(label)}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.8rem', fontFamily: 'Fira Code', margin: 0 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

function HeatmapChart({ data, columns }) {
  if (!data?.length) return null;
  const vals = data.map(d => d.value).filter(v => v !== null);
  const min = Math.min(...vals);
  const max = Math.max(...vals);

  const getColor = (val) => {
    if (val === null) return '#1A2235';
    const t = (val - min) / (max - min);
    if (t < 0.5) {
      const r = Math.round(59 + t * 2 * (239 - 59));
      const g = Math.round(130 + t * 2 * (68 - 130));
      const b = Math.round(246 + t * 2 * (68 - 246));
      return `rgb(${r},${g},${b})`;
    } else {
      return `rgb(239,68,68)`;
    }
  };

  const cols = [...new Set(data.map(d => d.x))];
  const rows = [...new Set(data.map(d => d.y))];
  const cellSize = Math.min(Math.floor(500 / cols.length), 80);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'inline-block', minWidth: '100%' }}>
        <div style={{ display: 'flex', marginLeft: 100 }}>
          {cols.map(c => (
            <div key={c} style={{ width: cellSize, fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 2px' }}>{c}</div>
          ))}
        </div>
        {rows.map(row => (
          <div key={row} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 100, fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'right', paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row}</div>
            {cols.map(col => {
              const cell = data.find(d => d.x === col && d.y === row);
              const val = cell?.value ?? null;
              return (
                <div key={col} style={{
                  width: cellSize, height: cellSize,
                  background: getColor(val),
                  border: '1px solid var(--bg-base)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.55rem', color: '#fff', fontFamily: 'Fira Code',
                  title: `${row} × ${col}: ${val?.toFixed(2) ?? 'N/A'}`,
                  cursor: 'default',
                }}>
                  {val !== null ? val.toFixed(2) : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function BoxPlotChart({ data }) {
  if (!data?.length) return null;
  const d = data[0];
  const range = d.max - d.min;
  const toPercent = v => ((v - d.min) / range) * 100;

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <div style={{ position: 'relative', height: 80 }}>
        <div style={{ position: 'absolute', top: 30, left: `${toPercent(d.min)}%`, right: `${100 - toPercent(d.max)}%`, height: 2, background: 'var(--text-muted)' }} />
        <div style={{
          position: 'absolute', top: 10, height: 40,
          left: `${toPercent(d.q1)}%`, right: `${100 - toPercent(d.q3)}%`,
          background: 'rgba(59,130,246,0.3)', border: '2px solid var(--primary)', borderRadius: 4,
        }} />
        <div style={{ position: 'absolute', top: 5, height: 50, left: `${toPercent(d.median)}%`, width: 3, background: 'var(--accent)', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', top: 5, left: `${toPercent(d.min)}%`, width: 2, height: 50, background: 'var(--text-muted)' }} />
        <div style={{ position: 'absolute', top: 5, left: `${toPercent(d.max)}%`, width: 2, height: 50, background: 'var(--text-muted)' }} />
        {d.outliers?.slice(0, 30).map((o, i) => (
          <div key={i} style={{ position: 'absolute', top: 25, left: `${toPercent(o)}%`, width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', transform: 'translate(-50%,-50%)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Fira Code', marginTop: 8 }}>
        <span>Min: {d.min?.toFixed(2)}</span>
        <span>Q1: {d.q1?.toFixed(2)}</span>
        <span style={{ color: 'var(--accent)' }}>Median: {d.median?.toFixed(2)}</span>
        <span>Q3: {d.q3?.toFixed(2)}</span>
        <span>Max: {d.max?.toFixed(2)}</span>
      </div>
      <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Mean: <span style={{ color: 'var(--primary-light)', fontFamily: 'Fira Code' }}>{d.mean?.toFixed(2)}</span>
        {' | '}Outliers detected: <span style={{ color: 'var(--danger)' }}>{d.outliers?.length}</span>
      </div>
    </div>
  );
}

export default function ChartRenderer({ suggestion, sessionId, customConfig }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  const config = customConfig || suggestion;

  const handleDownloadChart = async () => {
    if (!chartRef.current) return;
    try {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: isDark ? '#111111' : '#FFD6A6',
        scale: 2, // High resolution
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${config.title || 'chart'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download chart', err);
    }
  };

  useEffect(() => {
    if (!config || !sessionId) return;
    setLoading(true);
    setError(null);
    getChartData(sessionId, config.type, config.x, config.y, config.bins || 20)
      .then(res => setData(res.data || []))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load chart data'))
      .finally(() => setLoading(false));
  }, [config, sessionId]);

  if (loading) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ animation: 'spin 1s linear infinite', width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading visualization...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#FCA5A5' }}>
        <AlertCircle size={20} /> <span style={{ fontSize: '0.875rem' }}>{error}</span>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No data available for this chart
      </div>
    );
  }

  const xKey = config.x;
  const yKey = config.y;

  const commonProps = {
    width: '100%', data,
    margin: { top: 10, right: 20, left: 0, bottom: 30 },
  };

  const axisStyle = { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Fira Code' };

  let chartContent = null;

  if (config.type === 'heatmap') {
    chartContent = <HeatmapChart data={data} />;
  } else if (config.type === 'box') {
    chartContent = <BoxPlotChart data={data} />;
  } else {
    chartContent = (
      <ResponsiveContainer width="100%" height={320}>
        {config.type === 'bar' ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={xKey} tick={axisStyle} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={yKey} radius={[4, 4, 0, 0]} fill="url(#barGrad)" maxBarSize={60}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : config.type === 'line' ? (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={xKey} tick={axisStyle} angle={-30} textAnchor="end" interval={Math.floor(data.length / 8)} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: 'var(--primary)' }} />
          </LineChart>
        ) : config.type === 'area' ? (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={xKey} tick={axisStyle} angle={-30} textAnchor="end" interval={Math.floor(data.length / 8)} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={yKey} stroke="var(--primary)" fill="url(#areaGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        ) : config.type === 'scatter' ? (
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={xKey} type="number" name={xKey} tick={axisStyle} />
            <YAxis dataKey={yKey} type="number" name={yKey} tick={axisStyle} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Scatter data={data} fill="var(--primary)" fillOpacity={0.7} />
          </ScatterChart>
        ) : config.type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={{ stroke: 'var(--text-muted)' }}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--bg-card)" strokeWidth={2} />)}
            </Pie>
            <Tooltip formatter={(v) => v.toLocaleString()} />
            <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v}</span>} />
          </PieChart>
        ) : config.type === 'histogram' ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="bin" tick={{ ...axisStyle, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 6)} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="var(--primary)" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
          </BarChart>
        ) : null}
      </ResponsiveContainer>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={handleDownloadChart}
        className="btn btn-ghost"
        style={{ position: 'absolute', top: -35, right: 0, padding: '0.2rem 0.6rem', fontSize: '0.75rem', zIndex: 10 }}
        title="Download Chart as PNG"
      >
        <Download size={14} /> PNG
      </button>
      <div ref={chartRef} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px' }}>
        {chartContent}
      </div>
    </div>
  );
}
