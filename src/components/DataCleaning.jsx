import React, { useState } from 'react';
import { Trash2, Edit3, Droplet, Plus, Play, AlertCircle, X } from 'lucide-react';
import { cleanData } from '../api';

export default function DataCleaning({ sessionId, columns, statistics, onDataCleaned }) {
  const [operations, setOperations] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [actionType, setActionType] = useState('drop_column');
  const [selectedCol, setSelectedCol] = useState(columns[0]);
  const [newName, setNewName] = useState('');
  const [fillMethod, setFillMethod] = useState('mean');

  const handleAddOperation = (e) => {
    e.preventDefault();
    let op = { action: actionType, column: selectedCol };
    
    if (actionType === 'rename_column') {
      if (!newName.trim()) return;
      op.old_name = selectedCol;
      op.new_name = newName.trim();
      op.desc = `Rename '${selectedCol}' to '${newName.trim()}'`;
    } else if (actionType === 'drop_column') {
      op.desc = `Drop column '${selectedCol}'`;
    } else if (actionType === 'fill_missing') {
      op.method = fillMethod;
      op.desc = `Fill missing in '${selectedCol}' using ${fillMethod}`;
    } else if (actionType === 'drop_missing') {
      op.desc = `Drop rows with missing values in '${selectedCol}'`;
    }

    setOperations([...operations, op]);
    setNewName('');
  };

  const handleRemoveOp = (index) => {
    setOperations(operations.filter((_, i) => i !== index));
  };

  const handleApply = async () => {
    if (operations.length === 0) return;
    setIsApplying(true);
    setError(null);
    try {
      const newData = await cleanData(sessionId, operations);
      setOperations([]); // clear queue
      onDataCleaned(newData); // update entire dashboard state
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Left side: Add Operations */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Data Cleaning Studio</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Queue up data cleaning operations and apply them to your dataset.
        </p>

        <form onSubmit={handleAddOperation} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Action</label>
            <select value={actionType} onChange={e => setActionType(e.target.value)}>
              <option value="drop_column">Drop Column</option>
              <option value="rename_column">Rename Column</option>
              <option value="fill_missing">Fill Missing Values</option>
              <option value="drop_missing">Drop Missing Rows</option>
            </select>
          </div>

          <div>
            <label>Target Column</label>
            <select value={selectedCol} onChange={e => setSelectedCol(e.target.value)}>
              {actionType === 'drop_missing' && <option value="All">All Columns</option>}
              {columns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {actionType === 'rename_column' && (
            <div>
              <label>New Name</label>
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                placeholder="Enter new column name" 
                required 
              />
            </div>
          )}

          {actionType === 'fill_missing' && (
            <div>
              <label>Fill Method</label>
              <select value={fillMethod} onChange={e => setFillMethod(e.target.value)}>
                <option value="mean">Mean (Average)</option>
                <option value="median">Median</option>
                <option value="mode">Mode (Most Frequent)</option>
                <option value="zero">Zero (0)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-ghost" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            <Plus size={16} /> Add to Queue
          </button>
        </form>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px', marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}
      </div>

      {/* Right side: Operations Queue */}
      <div className="card" style={{ background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Operation Queue ({operations.length})</h3>
          <button 
            className="btn btn-primary" 
            onClick={handleApply} 
            disabled={operations.length === 0 || isApplying}
          >
            {isApplying ? 'Applying...' : <><Play size={16} /> Apply All</>}
          </button>
        </div>

        {operations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Droplet size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Your queue is empty.</p>
            <p style={{ fontSize: '0.8rem' }}>Select an action on the left to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {operations.map((op, i) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', background: 'var(--bg-card)', 
                borderRadius: '8px', border: '1px solid var(--border)' 
              }}>
                <span style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--primary)', marginRight: 8 }}>{i + 1}.</span>
                  {op.desc}
                </span>
                <button 
                  onClick={() => handleRemoveOp(i)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  title="Remove operation"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
