'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, locationApi, roleApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Location, Role } from '@/types';

export default function UsersPage() {
  const router = useRouter();
  const { token, user: currentUser } = useAuthStore();
  
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: '',
    locationIds: [] as number[]
  });

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    const userRoleStr = currentUser?.role?.toString().toLowerCase() || '';
    if (!userRoleStr.includes('admin')) {
      router.push('/admin');
      return;
    }
    loadData();
  }, [token]);

  async function loadData() {
    setLoading(true);
    try {
      let [u, locs, rs] = await Promise.all([
        userApi.getAll(),
        locationApi.getAll(),
        roleApi.getAll()
      ]);
      
      const roleStr = currentUser?.role?.toString().toLowerCase() || '';
      const myBranches = currentUser?.locationIds || [];

      if (!roleStr.includes('superadmin')) {
        u = u.filter((usr: any) => {
          if (myBranches.length === 0) return usr.id === currentUser?.id;
          return usr.locationIds?.some((bid: number) => myBranches.includes(bid)) || usr.id === currentUser?.id;
        });
        
        if (myBranches.length > 0) {
          locs = locs.filter(l => myBranches.includes(l.id));
        }
      }
      
      setUsers(u);
      setLocations(locs);
      setRoles(rs);
      
      // Set default role if not already selected
      if (!form.role && rs.length > 0) {
        setForm(prev => ({ ...prev, role: rs[0].name }));
      }
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditItem(null);
    const roleStr = currentUser?.role?.toLowerCase().replace(/[^a-z]/g, '') || '';
    const defaultLocs = (roleStr !== 'superadmin' && currentUser?.locationIds) 
      ? currentUser.locationIds 
      : [];
      
    setForm({ name: '', email: '', password: '', role: 'staff', locationIds: defaultLocs });
    setShowForm(true);
  }

  function openEditForm(user: any) {
    setEditItem(user);
    setForm({ 
      name: user.name, 
      email: user.email, 
      password: '', 
      role: user.role, 
      locationIds: user.locationIds || [] 
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.email || (!editItem && !form.password)) return;
    setSaving(true);
    try {
      if (editItem) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await userApi.update(editItem.id, payload);
      } else {
        await userApi.create(form);
      }
      setShowForm(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(id: number) {
    if (id === currentUser?.id) {
       alert("You cannot delete yourself!");
       return;
    }
    if (!confirm('Are you sure you want to delete this user?')) return;
    await userApi.delete(id);
    await loadData();
  }

  const getBranchNames = (locIds: number[]) => {
    if (!locIds || locIds.length === 0) return 'All Branches';
    return locIds.map(id => locations.find(l => l.id === id)?.name || 'Unknown').join(', ');
  };

  const toggleLocation = (id: number) => {
    setForm(prev => ({
      ...prev,
      locationIds: prev.locationIds.includes(id) 
        ? prev.locationIds.filter(bid => bid !== id)
        : [...prev.locationIds, id]
    }));
  };

  return (
    <>
      <main className="admin-main">
        <div className="topbar">
          <div>
            <h1>👥 User Management</h1>
            <p className="subtitle">Manage admin and staff accounts</p>
          </div>
          <button className="add-btn" onClick={openAddForm}>+ Add User</button>
        </div>

        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : (
          <div className="users-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Branches</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {String(u.role).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="branch-cell">{getBranchNames(u.locationIds)}</td>
                    <td>
                      <span className={`status-pill ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => openEditForm(u)} title="Edit">✏️</button>
                      <button onClick={() => deleteUser(u.id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal medium" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password {editItem ? '(leave blank to keep current)' : '*'}</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    {roles.length === 0 && <option value="">No roles available</option>}
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full">
                <label>Assigned Branches (Select one or more)</label>
                <div className="branches-multiselect">
                  {locations.map(loc => (
                    <label key={loc.id} className="branch-checkbox">
                      <input 
                        type="checkbox" 
                        checked={form.locationIds.includes(loc.id)}
                        onChange={() => toggleLocation(loc.id)}
                      />
                      <span>{loc.name}</span>
                    </label>
                  ))}
                  {locations.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No branches available</p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editItem ? 'Update User' : 'Create User')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-main { flex: 1; padding: 2rem; }
        .topbar { display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem; }
        h1 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
        .subtitle { margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b; }
        .add-btn { background: #6366f1; color: white; border: none; border-radius: 0.75rem; padding: 0.75rem 1.5rem; cursor: pointer; font-weight: 600; }
        
        .users-table-wrap { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: #f8fafc; padding: 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .admin-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; }
        .branch-cell { max-width: 250px; white-space: normal; line-height: 1.4; }
        
        .role-badge { padding: 0.25rem 0.6rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .role-badge.super_admin { background: #fee2e2; color: #ef4444; }
        .role-badge.admin { background: #fef3c7; color: #d97706; }
        .role-badge.manager { background: #e0e7ff; color: #4338ca; }
        .role-badge.staff { background: #f1f5f9; color: #64748b; }
        
        .status-pill { padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; }
        .status-pill.active { background: #dcfce7; color: #16a34a; }
        .status-pill.inactive { background: #f1f5f9; color: #94a3b8; }
        
        .actions-cell { display: flex; gap: 0.5rem; }
        .actions-cell button { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.4rem; border-radius: 0.5rem; cursor: pointer; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal { background: white; border-radius: 1rem; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .modal.medium { max-width: 600px; }
        .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 1.1rem; }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
        .form-group input, .form-group select { padding: 0.65rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; outline: none; }
        
        .branches-multiselect { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; max-height: 200px; overflow-y: auto; }
        .branch-checkbox { display: flex; align-items: center; gap: 0.65rem; font-size: 0.85rem; color: #334155; cursor: pointer; padding: 0.4rem; border-radius: 0.35rem; transition: background 0.2s; }
        .branch-checkbox:hover { background: #f1f5f9; }
        .branch-checkbox input { width: 1.1rem; height: 1.1rem; }
        
        .modal-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; }
        .cancel-btn { padding: 0.65rem 1.25rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; background: white; cursor: pointer; }
        .save-btn { padding: 0.65rem 1.25rem; border-radius: 0.5rem; background: #6366f1; color: white; border: none; cursor: pointer; font-weight: 600; }
      `}</style>
    </>
  );
}
