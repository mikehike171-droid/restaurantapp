'use client';
// src/app/admin/locations/page.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locationApi, orderApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Location } from '@/types';

export default function LocationsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTableForm, setShowTableForm] = useState<number | null>(null);
  const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: '4' });
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', email: '' });

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    loadLocations();
  }, [token]);

  async function loadLocations() {
    const locs = await locationApi.getAll();
    setLocations(locs);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.name || !form.address || !form.city) return;
    setSaving(true);
    try {
      await locationApi.create(form);
      setShowForm(false);
      setForm({ name: '', address: '', city: '', phone: '', email: '' });
      await loadLocations();
    } finally {
      setSaving(false);
    }
  }

  async function addTable() {
    if (!showTableForm || !tableForm.tableNumber) return;
    await orderApi.getTables(showTableForm); // just to verify location
    await fetch(`/api/v1/orders/location/${showTableForm}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tableNumber: tableForm.tableNumber, capacity: parseInt(tableForm.capacity) }),
    });
    setShowTableForm(null);
    setTableForm({ tableNumber: '', capacity: '4' });
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <>
      <main className="admin-main">
        <div className="topbar">
          <div>
            <h1>📍 Locations</h1>
            <p className="subtitle">Manage all your restaurant branches</p>
          </div>
          <button className="add-btn" onClick={() => setShowForm(true)}>+ Add Location</button>
        </div>

        <div className="locations-grid">
          {locations.map(loc => (
            <div key={loc.id} className="loc-card">
              <div className="loc-header">
                <div>
                  <h2>{loc.name}</h2>
                  <p className="loc-city">📍 {loc.city}</p>
                </div>
                <span className={`loc-badge ${loc.isActive ? 'active' : 'inactive'}`}>
                  {loc.isActive ? '🟢 Active' : '🔴 Inactive'}
                </span>
              </div>

              <div className="loc-details">
                <div className="detail-row"><span>🏠</span><span>{loc.address}</span></div>
                {loc.phone && <div className="detail-row"><span>📞</span><span>{loc.phone}</span></div>}
                <div className="detail-row"><span>🔑</span><code>{loc.qrCodeToken}</code></div>
              </div>

              <div className="loc-actions">
                <Link href={`/admin/menu?location=${loc.id}`} className="loc-action-btn menu">🍛 Manage Menu</Link>
                <Link href={`/admin/qr-codes`} className="loc-action-btn qr">📱 QR Code</Link>
                <button className="loc-action-btn table" onClick={() => setShowTableForm(loc.id)}>🪑 Add Table</button>
              </div>
            </div>
          ))}

          {/* Add Location Card */}
          <button className="add-loc-card" onClick={() => setShowForm(true)}>
            <span>+</span>
            <p>Add New Location</p>
          </button>
        </div>
      </main>

      {/* Add Location Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Location</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Restaurant Name *</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="e.g. Spice Garden - Hitech City" 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input 
                    value={form.city} 
                    onChange={e => setForm({...form, city: e.target.value})} 
                    placeholder="e.g. Hyderabad" 
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    placeholder="+91..." 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Full Address *</label>
                <input 
                  value={form.address} 
                  onChange={e => setForm({...form, address: e.target.value})} 
                  placeholder="Street name, Area, PIN..." 
                />
              </div>
              <div className="form-group">
                <label>Email (Manager)</label>
                <input 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  placeholder="manager@example.com" 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button 
                className="save-btn" 
                onClick={handleSave} 
                disabled={saving || !form.name || !form.address || !form.city}
              >
                {saving ? 'Creating...' : 'Create Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showTableForm && (
        <div className="modal-overlay" onClick={() => setShowTableForm(null)}>
          <div className="modal small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Table</h2>
              <button onClick={() => setShowTableForm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
                Adding table for {locations.find(l => l.id === showTableForm)?.name}
              </p>
              <div className="form-group">
                <label>Table Number *</label>
                <input 
                  value={tableForm.tableNumber} 
                  onChange={e => setTableForm({...tableForm, tableNumber: e.target.value})} 
                  placeholder="e.g. T12" 
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input 
                  type="number"
                  value={tableForm.capacity} 
                  onChange={e => setTableForm({...tableForm, capacity: e.target.value})} 
                  min="1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowTableForm(null)}>Cancel</button>
              <button 
                className="save-btn" 
                onClick={addTable} 
                disabled={!tableForm.tableNumber}
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .admin-main { flex: 1; }
        .topbar { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; }
        h1 { margin: 0 0 0.25rem; font-size: 1.25rem; font-weight: bold; color: #111827; }
        .subtitle { margin: 0; font-size: 0.875rem; color: #6b7280; }
        .add-btn { background: #6366f1; color: white; border: none; border-radius: 0.75rem; padding: 0.65rem 1.25rem; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
        .locations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; padding: 2rem; }
        .loc-card { background: white; border-radius: 1rem; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .loc-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.25rem; border-bottom: 1px solid #f3f4f6; }
        h2 { margin: 0 0 0.25rem; font-size: 1rem; color: #111827; }
        .loc-city { margin: 0; font-size: 0.8rem; color: #6b7280; }
        .loc-badge { padding: 0.25rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .loc-badge.active { background: #dcfce7; color: #16a34a; }
        .loc-badge.inactive { background: #fef2f2; color: #ef4444; }
        .loc-details { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .detail-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.83rem; color: #374151; }
        .detail-row code { background: #f3f4f6; padding: 0.1rem 0.35rem; border-radius: 0.25rem; font-size: 0.75rem; }
        .loc-actions { display: flex; gap: 0.5rem; padding: 1rem 1.25rem; border-top: 1px solid #f3f4f6; flex-wrap: wrap; }
        .loc-action-btn { padding: 0.4rem 0.75rem; border-radius: 0.5rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: none; border: none; }
        .loc-action-btn.menu { background: #ede9fe; color: #6d28d9; }
        .loc-action-btn.qr { background: #dbeafe; color: #1d4ed8; }
        .loc-action-btn.table { background: #fef3c7; color: #b45309; }
        .add-loc-card { background: white; border: 2px dashed #d1d5db; border-radius: 1rem; padding: 3rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; color: #9ca3af; font-size: 0.9rem; }
        .add-loc-card span { font-size: 2rem; }
        .add-loc-card:hover { border-color: #6366f1; color: #6366f1; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 520px; }
        .modal.small { max-width: 380px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
        .modal-header h2 { margin: 0; font-size: 1.1rem; color: #111827; }
        .modal-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
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
