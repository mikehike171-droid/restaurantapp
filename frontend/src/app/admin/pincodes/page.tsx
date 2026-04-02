'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { locationApi } from '@/lib/api';
import { Location } from '@/types';

interface Pincode {
  id: number;
  pincode: string;
  areaName: string;
  locationId: number;
  location?: Location;
  deliveryCharge: number;
  minOrderAmount: number;
  estimatedDeliveryTime: string;
  isActive: boolean;
}

interface PincodeForm {
  pincode: string;
  areaName: string;
  locationId: number;
  deliveryCharge: number;
  minOrderAmount: number;
  estimatedDeliveryTime: string;
  isActive: boolean;
}

const EMPTY_FORM: PincodeForm = { 
  pincode: '', 
  areaName: '', 
  locationId: 0, 
  deliveryCharge: 0, 
  minOrderAmount: 0, 
  estimatedDeliveryTime: '30-45 mins', 
  isActive: true 
};

export default function PincodesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Pincode | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      const [p, l] = await Promise.all([
        api.get('/admin/pincodes').then(r => r.data),
        locationApi.getAll(),
      ]);
      setPincodes(p);
      setLocations(l);
    } finally { setLoading(false); }
  }

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(p: Pincode) {
    setEditing(p);
    setForm({ pincode: p.pincode, areaName: p.areaName, locationId: p.locationId, deliveryCharge: p.deliveryCharge, minOrderAmount: p.minOrderAmount, estimatedDeliveryTime: p.estimatedDeliveryTime, isActive: p.isActive });
    setShowModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/pincodes/${editing.id}`, form);
      } else {
        await api.post('/admin/pincodes', form);
      }
      setShowModal(false);
      load();
    } finally { setSaving(false); }
  }

  async function remove(id: number) {
    if (!confirm('Delete this pincode?')) return;
    await api.delete(`/admin/pincodes/${id}`);
    load();
  }

  async function toggle(id: number) {
    await api.patch(`/admin/pincodes/${id}/status`);
    load();
  }

  const filtered = pincodes.filter(p =>
    p.pincode.includes(search) || p.areaName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ flex: 1, padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>📍 Manage Delivery Pincodes</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>Configure serviceable delivery zones per branch</p>
        </div>
        <button onClick={openAdd} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          + Add Pincode
        </button>
      </div>

      {/* Search */}
      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
        <input
          placeholder="Search by pincode or area name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['#', 'Pincode', 'Area Name', 'Branch', 'Delivery Charge', 'Min Order', 'Est. Time', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.875rem 1rem', color: '#94a3b8' }}>{i + 1}</td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#1e293b' }}>{p.pincode}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>{p.areaName}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>{p.location?.name || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>₹{p.deliveryCharge}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>₹{p.minOrderAmount}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#374151' }}>{p.estimatedDeliveryTime}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ background: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#16a34a' : '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.78rem', fontWeight: 700 }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(p)} style={{ background: '#ede9fe', color: '#6d28d9', border: 'none', padding: '0.3rem 0.65rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => toggle(p.id)} style={{ background: p.isActive ? '#fef3c7' : '#dcfce7', color: p.isActive ? '#d97706' : '#16a34a', border: 'none', padding: '0.3rem 0.65rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => remove(p.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.65rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No pincodes found. Add your first delivery zone.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {editing ? 'Edit Pincode' : 'Add Pincode Zone'}
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <Field label="Pincode *" value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v }))} placeholder="e.g. 500032" disabled={!!editing} />
              <Field label="Area / Location Name *" value={form.areaName} onChange={v => setForm(f => ({ ...f, areaName: v }))} placeholder="e.g. Gachibowli" />
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>Linked Branch *</label>
                <select value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: Number(e.target.value) }))}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.9rem', outline: 'none' }}>
                  <option value={0}>Select branch...</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Delivery Charge (₹)" value={String(form.deliveryCharge)} onChange={v => setForm(f => ({ ...f, deliveryCharge: Number(v) }))} type="number" />
                <Field label="Min Order (₹)" value={String(form.minOrderAmount)} onChange={v => setForm(f => ({ ...f, minOrderAmount: Number(v) }))} type="number" />
              </div>
              <Field label="Est. Delivery Time" value={form.estimatedDeliveryTime} onChange={v => setForm(f => ({ ...f, estimatedDeliveryTime: v }))} placeholder="e.g. 30-45 mins" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: '1rem', height: '1rem' }} />
                <label htmlFor="isActive" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Active (visible to customers)</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={save} disabled={saving || !form.pincode || !form.areaName || form.locationId === 0}
                style={{ flex: 1, padding: '0.75rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : (editing ? 'Update' : 'Add Pincode')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, value, onChange, placeholder = '', type = 'text', disabled = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: disabled ? '#f8fafc' : 'white' }} />
    </div>
  );
}
