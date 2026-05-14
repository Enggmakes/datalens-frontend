import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { LayoutDashboard, BarChart2, Sliders, Table2, TrendingUp, Zap, Database, PieChart, Moon, Sun } from 'lucide-react';

function Navbar({ theme, toggleTheme }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: theme === 'dark' ? 'rgba(10,15,30,0.85)' : 'rgba(255, 240, 190, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      height: 60,
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart2 size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: 'Fira Code', fontWeight: 700, fontSize: '1.1rem' }}>
          Data<span className="gradient-text">Lens</span>
        </span>
        <span className="badge badge-blue" style={{ marginLeft: '0.25rem' }}>v1.0</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button className="btn btn-ghost" onClick={toggleTheme} style={{ padding: '0.5rem', border: 'none' }} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Universal Analytics</span>
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
      <div style={{ marginBottom: '1rem' }}>
        <span className="badge badge-blue" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
          <Zap size={12} /> Zero Configuration Required
        </span>
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem', lineHeight: 1.1 }}>
        Universal Data<br />
        <span className="gradient-text">Analytics Platform</span>
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
        Upload any CSV or Excel file and instantly get intelligent visualizations, 
        statistical insights, and interactive charts — no coding required.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onGetStarted} id="hero-upload-btn" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          <Database size={18} /> Upload Your Data
        </button>
      </div>

      <div className="grid-4" style={{ maxWidth: 900, margin: '0 auto', gap: '1rem' }}>
        {features.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="card glass-hover" style={{ textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Icon size={18} color="#fff" />
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.desc}</div>
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main style={{ paddingTop: 60, minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div style={{ background: 'var(--gradient-hero)', minHeight: analysisData ? 0 : '100vh' }}>
          {/* Grid background pattern */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'var(--grid-pattern)',
            backgroundSize: '32px 32px',
          }} />

          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
            {!analysisData && !showUpload && (
              <HeroSection onGetStarted={() => setShowUpload(true)} />
            )}

            {!analysisData && showUpload && (
              <div style={{ paddingTop: '4rem', paddingBottom: '4rem' }} className="fade-in">
                <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Upload Your Dataset</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  Any CSV or Excel file — the system will auto-detect your data domain and suggest the best analysis
                </p>
                <FileUpload onUploadSuccess={handleUploadSuccess} />
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
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
        </div>
      </main>
    </>
  );
}
