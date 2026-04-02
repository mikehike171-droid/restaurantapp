'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locationApi, orderApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Location, RestaurantTable } from '@/types';

export default function TablesPage() {
  const router = useRouter();
  const { token, user, selectedLocationId, setSelectedLocation } = useAuthStore();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<RestaurantTable | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '4' });

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    loadInitialData();
  }, [token]);

  async function loadInitialData() {
    let locs = await locationApi.getAll();
    
    const role = user?.role?.toLowerCase().replace(/[^a-z]/g, '') || '';
    const allowedBranches = user?.locationIds || [];

    if (role !== 'superadmin' && allowedBranches.length > 0) {
      locs = locs.filter(l => allowedBranches.includes(l.id));
    }
    
    setLocations(locs);
    
    if (locs.length > 0) {
      const isValid = selectedLocationId && locs.some(l => l.id === selectedLocationId);
      if (!isValid) {
        setSelectedLocation(locs[0].id);
      }
    }
  }

  useEffect(() => {
    if (selectedLocationId) {
      loadTables();
    }
  }, [selectedLocationId]);

  async function loadTables() {
    if (!selectedLocationId) return;
    setLoading(true);
    try {
      const data = await orderApi.getTables(selectedLocationId);
      setTables(data);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditItem(null);
    setForm({ tableNumber: '', capacity: '4' });
    setShowForm(true);
  }

  function openEditForm(table: RestaurantTable) {
    setEditItem(table);
    setForm({ tableNumber: table.tableNumber, capacity: String(table.capacity) });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.tableNumber || !selectedLocationId) return;
    setSaving(true);
    try {
      const payload = { tableNumber: form.tableNumber, capacity: parseInt(form.capacity) };
      if (editItem) {
        await orderApi.updateTable(editItem.id, payload);
      } else {
        await orderApi.createTable(selectedLocationId, payload);
      }
      setShowForm(false);
      await loadTables();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this table?')) return;
    await orderApi.deleteTable(id);
    await loadTables();
  }

  return (
    <>
      <main className="admin-main">
        <div className="topbar">
          <div>
            <h1>🪑 Table Master</h1>
            <p className="subtitle">Manage dining tables for each branch</p>
          </div>
          <div className="topbar-actions">
            <select 
              className="location-select"
              value={selectedLocationId || ''} 
              onChange={(e) => setSelectedLocation(Number(e.target.value))}
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <button className="add-btn" onClick={openAddForm}>+ Add Table</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading tables...</div>
        ) : (
          <div className="tables-grid">
            {tables.map(table => (
              <div key={table.id} className="table-card">
                <div className="table-header">
                  <div className="table-number">{table.tableNumber}</div>
                  <div className={`status-badge ${table.isAvailable ? 'available' : 'occupied'}`}>
                    {table.isAvailable ? 'Available' : 'Occupied'}
                  </div>
                </div>
                <div className="table-info">
                  <p>Capacity: {table.capacity} Persons</p>
                </div>
                <div className="table-actions">
                  <button onClick={() => openEditForm(table)} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(table.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
            
            <button className="add-table-card" onClick={openAddForm}>
              <span>+</span>
              <p>Add New Table</p>
            </button>
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit Table' : 'Add New Table'}</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Table Number *</label>
                <input 
                  value={form.tableNumber} 
                  onChange={e => setForm({...form, tableNumber: e.target.value})} 
                  placeholder="e.g. T-01, VIP-1" 
                />
              </div>
              <div className="form-group">
                <label>Capacity (Persons)</label>
                <input 
                  type="number" 
                  value={form.capacity} 
                  onChange={e => setForm({...form, capacity: e.target.value})} 
                  min="1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button 
                className="save-btn" 
                onClick={handleSave} 
                disabled={saving || !form.tableNumber}
              >
                {saving ? 'Saving...' : (editItem ? 'Update Table' : 'Create Table')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-main { flex: 1; }
        .topbar { padding: 1.5rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: start; }
        h1 { margin: 0; font-size: 1.25rem; font-weight: bold; color: #111827; }
        .subtitle { margin: 0.25rem 0 0; font-size: 0.875rem; color: #6b7280; }
        .topbar-actions { display: flex; gap: 1rem; align-items: center; }
        .location-select { padding: 0.6rem; border-radius: 0.75rem; border: 1px solid #d1d5db; font-size: 0.9rem; outline: none; background: #f9fafb; }
        .add-btn { background: #6366f1; color: white; border: none; border-radius: 0.75rem; padding: 0.65rem 1.25rem; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
        
        .loading-state { padding: 3rem; text-align: center; color: #6b7280; font-size: 1.1rem; }
        .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; padding: 2rem; }
        
        .table-card { background: white; border-radius: 1rem; border: 1px solid #e5e7eb; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; transition: transform 0.2s; }
        .table-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .table-header { display: flex; justify-content: space-between; align-items: center; }
        .table-number { font-size: 1.5rem; font-weight: 800; color: #1e293b; }
        
        .status-badge { font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 2rem; font-weight: 600; }
        .status-badge.available { background: #dcfce7; color: #16a34a; }
        .status-badge.occupied { background: #fef2f2; color: #ef4444; }
        
        .table-info { color: #64748b; font-size: 0.9rem; }
        .table-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
        .table-actions button { flex: 1; background: #f8fafc; border: 1px solid #e5e7eb; padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; transition: all 0.2s; }
        .table-actions button:hover { background: #e2e8f0; border-color: #94a3b8; }

        .add-table-card { background: white; border: 2px dashed #d1d5db; border-radius: 1rem; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; color: #9ca3af; transition: all 0.2s; }
        .add-table-card span { font-size: 2rem; line-height: 1; }
        .add-table-card:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
        .modal-header h2 { margin: 0; font-size: 1.1rem; color: #111827; }
        .modal-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
        .form-group input { border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.6rem 0.75rem; font-size: 0.9rem; outline: none; }
        .form-group input:focus { border-color: #6366f1; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
        .cancel-btn { background: #f3f4f6; color: #374151; border: none; border-radius: 0.5rem; padding: 0.65rem 1.25rem; cursor: pointer; font-weight: 600; }
        .save-btn { background: #6366f1; color: white; border: none; border-radius: 0.5rem; padding: 0.65rem 1.5rem; cursor: pointer; font-weight: 600; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </>
  );
}
