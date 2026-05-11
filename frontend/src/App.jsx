import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { LayoutDashboard, BarChart2, Sliders, Table2, TrendingUp, Zap, Database, PieChart } from 'lucide-react';

function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'var(--nm-bg)',
      boxShadow: '0 4px 16px var(--nm-shadow-dark), 0 -2px 8px var(--nm-shadow-light)',
      padding: '0 2rem',
      height: 64,
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 12,
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-raised-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BarChart2 size={20} color="var(--accent)" />
        </div>
        <span style={{ fontFamily: 'Fira Code', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
          Data<span className="gradient-text">Lens</span>
        </span>
        <span className="badge badge-purple" style={{ marginLeft: '0.1rem' }}>v1.0</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Universal Analytics Platform
        </span>
      </div>
    </nav>
  );
}

function HeroSection({ onGetStarted }) {
  const features = [
    { icon: Database, title: 'Any Data Format', desc: 'CSV, Excel — any domain auto-detected' },
    { icon: Zap, title: 'Instant Analysis', desc: 'Auto-stats, correlations, outlier detection' },
    { icon: TrendingUp, title: 'Smart Charts', desc: 'AI suggests best visualizations for your data' },
    { icon: PieChart, title: 'Full Control', desc: 'Custom chart builder with column selection' },
  ];

  return (
    <div style={{ textAlign: 'center', padding: '6rem 1rem 3rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <span className="badge badge-purple" style={{ padding: '0.5rem 1.2rem', fontSize: '0.78rem' }}>
          <Zap size={12} /> Zero Configuration Required
        </span>
      </div>

      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        marginBottom: '1rem',
        lineHeight: 1.1,
        color: 'var(--text-primary)',
      }}>
        Universal Data<br />
        <span className="gradient-text">Analytics Platform</span>
      </h1>

      <p style={{
        fontSize: '1.05rem',
        color: 'var(--text-secondary)',
        maxWidth: 560,
        margin: '0 auto 2.5rem',
        lineHeight: 1.75,
        fontWeight: 500,
      }}>
        Upload any CSV or Excel file and instantly get intelligent visualizations,
        statistical insights, and interactive charts — no coding required.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-accent"
          onClick={onGetStarted}
          id="hero-upload-btn"
          style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}
        >
          <Database size={18} /> Upload Your Data
        </button>
      </div>

      <div className="grid-4" style={{ maxWidth: 920, margin: '0 auto' }}>
        {features.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="card" style={{ textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
              <div className="nm-accent-dot" style={{ width: 80, height: 80, top: -30, right: -30, opacity: 0.6 }} />
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-raised-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.9rem',
              }}>
                <Icon size={20} color="var(--accent)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>{f.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{f.desc}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {['Hospital Records', 'Student Grades', 'Sales Reports', 'Stock Data', 'HR Analytics', 'Disease Data', 'Any CSV'].map(t => (
          <span key={t} className="badge badge-purple">{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadSuccess = (data) => {
    setAnalysisData(data);
    setShowUpload(false);
  };

  const handleReset = () => {
    setAnalysisData(null);
    setShowUpload(false);
  };

  return (
    <>
      <Navbar />
      <main style={{
        paddingTop: 64,
        minHeight: '100vh',
        background: 'var(--nm-bg)',
      }}>
        {/* Subtle radial vignette */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 60% 20%, rgba(124,110,247,0.06) 0%, transparent 60%)',
        }} />

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          {!analysisData && !showUpload && (
            <HeroSection onGetStarted={() => setShowUpload(true)} />
          )}

          {!analysisData && showUpload && (
            <div style={{ paddingTop: '4rem', paddingBottom: '4rem' }} className="fade-in">
              <h2 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Upload Your Dataset
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.25rem', fontSize: '0.92rem', fontWeight: 500 }}>
                Any CSV or Excel file — the system will auto-detect your data domain and suggest the best analysis
              </p>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
              <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
                <button className="btn btn-ghost" onClick={() => setShowUpload(false)} id="back-to-home-btn">
                  ← Back to Home
                </button>
              </div>
            </div>
          )}

          {analysisData && (
            <div style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }} className="fade-in">
              <Dashboard analysisData={analysisData} onReset={handleReset} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
