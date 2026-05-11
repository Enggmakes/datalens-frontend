import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { uploadFile } from '../api';

export default function FileUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const data = await uploadFile(file, setProgress);
      onUploadSuccess(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file. Please check the backend is running.');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div
        {...getRootProps()}
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: 'var(--nm-bg)',
          transition: 'all var(--transition)',
          boxShadow: isDragActive
            ? 'var(--nm-inset), 0 0 0 3px var(--accent-glow)'
            : 'var(--nm-raised-lg)',
          border: isDragActive ? '2px solid var(--accent)' : '2px solid transparent',
        }}
      >
        <input {...getInputProps()} id="file-upload-input" />

        <div style={{
          width: 88, height: 88, margin: '0 auto 1.75rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--nm-bg)',
          boxShadow: isDragActive ? 'var(--nm-inset)' : 'var(--nm-raised)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--transition)',
        }}>
          <Upload size={36} color={isDragActive ? 'var(--accent)' : 'var(--text-muted)'} />
        </div>

        {uploading ? (
          <div>
            <p style={{ fontFamily: 'Fira Code', fontSize: '1rem', color: 'var(--accent)', marginBottom: '1.25rem', fontWeight: 600 }}>
              Analysing your data...
            </p>
            <div style={{
              background: 'var(--nm-surface)',
              boxShadow: 'var(--nm-inset)',
              borderRadius: 100, height: 8, overflow: 'hidden', maxWidth: 320, margin: '0 auto',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%)',
                borderRadius: 100,
                transition: 'width 0.3s ease',
                boxShadow: '0 0 8px var(--accent-glow)',
              }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem', fontWeight: 600 }}>
              {progress}% uploaded
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {isDragActive ? 'Drop your file here' : 'Upload your Data File'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', fontWeight: 500 }}>
              Drag & drop any CSV or Excel file — we'll automatically detect your data type and generate intelligent visualizations
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['CSV', 'XLSX', 'XLS'].map(fmt => (
                <span key={fmt} className="badge badge-purple">
                  <FileSpreadsheet size={12} /> {fmt}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedFile && !uploading && !error && (
        <div style={{
          marginTop: '1.25rem', padding: '0.85rem 1.1rem',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-raised-sm)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <FileSpreadsheet size={18} color="var(--success)" />
          <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {selectedFile.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {formatSize(selectedFile.size)}
          </span>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '1.25rem', padding: '0.85rem 1.1rem',
          background: 'rgba(224,123,123,0.1)',
          boxShadow: 'var(--nm-raised-sm)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(224,123,123,0.3)',
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          color: 'var(--danger)', fontSize: '0.875rem',
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Upload Failed</strong>
            <p style={{ margin: 0, marginTop: 2, fontSize: '0.82rem', fontWeight: 500 }}>{error}</p>
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginLeft: 'auto', padding: '0.2rem 0.5rem' }}
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
          Works with any data type — no configuration needed
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Hospital Records', 'Student Scores', 'Sales Data', 'Financial Reports', 'HR Data', 'Any CSV'].map(t => (
            <span key={t} className="badge badge-purple">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
