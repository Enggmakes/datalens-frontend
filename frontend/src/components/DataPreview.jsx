import React from 'react';
import { Table2 } from 'lucide-react';

export default function DataPreview({ data, columns }) {
  if (!data?.length) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Table2 size={18} color="var(--primary)" />
        <h3 style={{ fontSize: '1rem' }}>Data Preview</h3>
        <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>First {data.length} rows</span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40, color: 'var(--text-muted)' }}>#</th>
              {columns.map(col => (
                <th key={col} title={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'Fira Code', fontSize: '0.7rem' }}>{i + 1}</td>
                {columns.map(col => {
                  const val = row[col];
                  return (
                    <td key={col} title={val != null ? String(val) : 'null'}>
                      {val == null
                        ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.7rem' }}>null</span>
                        : <span style={{ fontFamily: typeof val === 'number' ? 'Fira Code' : 'inherit', color: typeof val === 'number' ? 'var(--primary-light)' : 'var(--text-primary)' }}>{String(val)}</span>
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
