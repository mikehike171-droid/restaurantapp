'use client';
// src/app/admin/menu/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locationApi, foodApi, categoryApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Location, FoodItem, Category } from '@/types';

export default function MenuManagerPage() {
  const router = useRouter();
  const { token, user, selectedLocationId, setSelectedLocation } = useAuthStore();

  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<FoodItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '', description: '', price: '', categoryId: '' as string | number, imageUrl: '',
    isVeg: true, preparationTime: '15', isAvailable: true, isActive: true,
    rating: '4.5', discountText: ''
  });

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    async function load() {
      let [locs, cats] = await Promise.all([locationApi.getAll(), categoryApi.getAll()]);
      
      const role = user?.role?.toLowerCase().replace(/[^a-z]/g, '') || '';
      const allowedBranches = user?.locationIds || [];

      if (role !== 'superadmin' && allowedBranches.length > 0) {
        locs = locs.filter(l => allowedBranches.includes(l.id));
      }
      
      setLocations(locs);
      setCategories(cats);
      
      if (locs.length > 0) {
        const isValid = selectedLocationId && locs.some(l => l.id === selectedLocationId);
        if (!isValid) {
          setSelectedLocation(locs[0].id);
        }
      }
      setLoading(false);
    }
    load();
  }, [token]);

  useEffect(() => {
    if (selectedLocationId) loadItems();
  }, [selectedLocationId]);

  async function loadItems() {
    if (!selectedLocationId) return;
    setLoading(true);
    try {
      const items = await foodApi.getByLocation(selectedLocationId);
      setFoodItems(items);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditItem(null);
    setForm({ 
      name: '', description: '', price: '', categoryId: categories[0]?.id || '', 
      imageUrl: '', isVeg: true, preparationTime: '15', isAvailable: true, isActive: true,
      rating: '4.5', discountText: ''
    });
    setShowForm(true);
  }

  function openEditForm(item: FoodItem) {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description || '', price: String(item.price),
      categoryId: item.categoryId, imageUrl: item.imageUrl || '',
      isVeg: item.isVeg, preparationTime: String(item.preparationTime), 
      isAvailable: item.isAvailable, isActive: item.isActive,
      rating: String(item.rating || '4.5'), discountText: item.discountText || ''
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.categoryId) return;
    setSaving(true);
    try {
      const payload = {
        ...form, price: parseFloat(form.price),
        preparationTime: parseInt(form.preparationTime),
        rating: parseFloat(form.rating),
        categoryId: Number(form.categoryId),
        locationId: Number(selectedLocationId),
      };
      if (editItem) await foodApi.update(editItem.id, payload);
      else await foodApi.create(payload);
      setShowForm(false);
      await loadItems();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: number) {
    await foodApi.toggle(id);
    await loadItems();
  }

  async function handleToggleVisibility(id: number) {
    await foodApi.toggleVisibility(id);
    await loadItems();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this item?')) return;
    await foodApi.delete(id);
    await loadItems();
  }

  const filteredItems = foodItems.filter(item => {
    const matchCat = filterCategory === 'all' || Number(item.categoryId) === Number(filterCategory);
    const matchSearch = searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCategoryName = (id: number | string) => categories.find(c => Number(c.id) === Number(id))?.name || '';
  const getCategoryIcon = (id: number | string) => categories.find(c => Number(c.id) === Number(id))?.icon || '';

  return (
    <>
      <main className="admin-main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Menu Manager</h1>
            <div className="location-select-wrap">
              <span>📍</span>
              <select value={selectedLocationId || ''} onChange={e => setSelectedLocation(Number(e.target.value))} className="location-select">
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
          </div>
          <button className="add-btn" onClick={openAddForm}>+ Add Food Item</button>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="cat-filters">
            <button className={`cat-btn ${filterCategory === 'all' ? 'active' : ''}`} onClick={() => setFilterCategory('all')}>All</button>
            {categories.map(cat => (
              <button key={cat.id} className={`cat-btn ${filterCategory === cat.id ? 'active' : ''}`} onClick={() => setFilterCategory(cat.id)}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items Table */}
        <div className="items-panel">
          <div className="panel-meta">{filteredItems.length} items {filterCategory !== 'all' && `in ${getCategoryName(filterCategory)}`}</div>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                    <th>Veg/Non</th>
                    <th>Prep.</th>
                    <th>Available (Sold Out)</th>
                    <th>Visible in App</th>
                    <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className={!item.isAvailable ? 'unavailable' : ''}>
                  <td>
                    <div className="item-cell">
                        {item.imageUrl ? <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} alt="" /> : <span>🍽️</span>}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="item-name">{item.name}</span>
                          {!item.isActive && <span className="hidden-tag">HIDDEN</span>}
                        </div>
                        <div className="item-desc">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="cat-tag">{getCategoryIcon(item.categoryId)} {getCategoryName(item.categoryId)}</span></td>
                  <td><strong>₹{item.price}</strong></td>
                   <td><span className={`veg-tag ${item.isVeg ? 'veg' : 'nonveg'}`}>{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span></td>
                  <td>{item.preparationTime} min</td>
                  <td>
                    <button
                      className={`status-switch ${item.isAvailable ? 'on' : 'off'}`}
                      onClick={() => handleToggle(item.id)}
                      title={item.isAvailable ? 'Click to mark as Unavailable' : 'Click to mark as Available'}
                    >
                      <span className="switch-dot"></span>
                      <span className="switch-text">{item.isAvailable ? 'ON' : 'OFF'}</span>
                    </button>
                  </td>
                  <td>
                    <button
                      className={`status-switch ${item.isActive ? 'on' : 'off'}`}
                      onClick={() => handleToggleVisibility(item.id)}
                      title={item.isActive ? 'Click to Hide from App' : 'Click to Show in App'}
                    >
                      <span className="switch-dot"></span>
                      <span className="switch-text">{item.isActive ? 'SHOW' : 'HIDE'}</span>
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEditForm(item)}>✏️ Edit</button>
                      <button className="del-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No items found. Add some food items!</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editItem ? 'Edit Food Item' : 'Add New Food Item'}</h2>
                <button onClick={() => setShowForm(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Masala Dosa" />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                  <label>Availability (In Stock)</label>
                  <select 
                    value={form.isAvailable ? 'true' : 'false'}
                    onChange={e => setForm({ ...form, isAvailable: e.target.value === 'true' })}
                  >
                    <option value="true">Available (In Stock)</option>
                    <option value="false">Sold Out (Out of Stock)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Visibility (Show in App)</label>
                  <select 
                    value={form.isActive ? 'true' : 'false'}
                    onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Visible (Public)</option>
                    <option value="false">Hidden (Draft)</option>
                  </select>
                </div>
              </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description..." rows={2} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" min="0" step="0.5" />
                  </div>
                  <div className="form-group">
                    <label>Prep Time (mins)</label>
                    <input type="number" value={form.preparationTime} onChange={e => setForm({...form, preparationTime: e.target.value})} min="1" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rating (e.g. 4.5) *</label>
                    <input type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Discount Tag (e.g. 125 OFF above 249)</label>
                    <input value={form.discountText} onChange={e => setForm({...form, discountText: e.target.value})} placeholder="FLAT 50% OFF" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-check">
                    <input type="checkbox" id="isVeg" checked={form.isVeg} onChange={e => setForm({...form, isVeg: e.target.checked})} />
                    <label htmlFor="isVeg">🟢 Vegetarian</label>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" id="isAvailable" checked={form.isAvailable} onChange={e => setForm({...form, isAvailable: e.target.checked})} />
                    <label htmlFor="isAvailable">✓ Available Now</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="save-btn" onClick={handleSave} disabled={saving || !form.name || !form.price || !form.categoryId}>
                  {saving ? 'Saving...' : (editItem ? 'Update Item' : 'Add Item')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .admin-main { flex: 1; min-width: 0; }
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; }
        .topbar-left { display: flex; align-items: center; gap: 1.5rem; }
        h1 { margin: 0; font-size: 1.25rem; font-weight: bold; color: #111827; }
        .location-select-wrap { display: flex; align-items: center; gap: 0.5rem; background: #f3f4f6; border-radius: 0.75rem; padding: 0.4rem 0.75rem; }
        .location-select { border: none; background: transparent; font-size: 0.9rem; color: #374151; cursor: pointer; outline: none; font-weight: 600; min-width: 180px; }
        .add-btn { background: #6366f1; color: white; border: none; border-radius: 0.75rem; padding: 0.65rem 1.25rem; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
        .filters { display: flex; align-items: center; gap: 1rem; padding: 1rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; flex-wrap: wrap; }
        .search-input { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.5rem 1rem; font-size: 0.9rem; outline: none; width: 200px; }
        .cat-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .cat-btn { padding: 0.35rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 1.5rem; background: transparent; cursor: pointer; font-size: 0.8rem; color: #6b7280; }
        .cat-btn.active { background: #1e1b4b; color: white; border-color: #1e1b4b; }
        .items-panel { margin: 1.5rem 2rem; background: white; border-radius: 1rem; border: 1px solid #e5e7eb; overflow: hidden; }
        .panel-meta { padding: 0.75rem 1.5rem; font-size: 0.8rem; color: #9ca3af; border-bottom: 1px solid #f3f4f6; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .items-table th { background: #f9fafb; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; }
        .items-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
        .items-table tr.unavailable td { background: #f9fafb; }
        .items-table tr.unavailable .item-name { color: #9ca3af; text-decoration: line-through; }
        .item-cell { display: flex; align-items: center; gap: 0.75rem; }
        .item-thumb { width: 40px; height: 40px; border-radius: 0.5rem; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .item-name { font-weight: 600; color: #111827; }
        .hidden-tag { background: #fee2e2; color: #ef4444; font-size: 0.65rem; padding: 0.1rem 0.3rem; border-radius: 0.25rem; font-weight: 800; }
        .item-desc { font-size: 0.75rem; color: #9ca3af; }
        .cat-tag { background: #ede9fe; color: #6d28d9; padding: 0.2rem 0.5rem; border-radius: 0.35rem; font-size: 0.78rem; }
        .veg-tag { font-size: 0.78rem; }
        .status-switch { 
          display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; 
          border-radius: 2rem; border: 1px solid #e5e7eb; cursor: pointer; font-size: 0.7rem; 
          font-weight: 800; transition: all 0.2s; min-width: 70px; position: relative;
        }
        .status-switch.on { background: #10b981; color: white; border-color: #059669; justify-content: flex-end; }
        .status-switch.off { background: #ef4444; color: white; border-color: #dc2626; justify-content: flex-start; }
        .switch-dot { width: 14px; height: 14px; border-radius: 50%; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .status-switch.on .switch-text { margin-right: auto; padding-left: 4px; }
        .status-switch.off .switch-text { margin-left: auto; padding-right: 4px; }
        .action-btns { display: flex; gap: 0.5rem; }
        .edit-btn, .del-btn { border: 1px solid #e5e7eb; background: white; border-radius: 0.5rem; padding: 0.3rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
        .edit-btn:hover { background: #f3f4f6; }
        .del-btn:hover { background: #fef2f2; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); display: flex; flex-direction: column; max-height: 90vh; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
        .modal-header h2 { margin: 0; font-size: 1.1rem; color: #111827; }
        .modal-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; overflow-y: auto; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
        .form-group input, .form-group select, .form-group textarea {
          border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.6rem 0.75rem;
          font-size: 0.9rem; outline: none; font-family: inherit; width: 100%; box-sizing: border-box;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6366f1; }
        .form-check { display: flex; align-items: center; gap: 0.5rem; }
        .form-check label { font-size: 0.9rem; color: #374151; cursor: pointer; }
        .form-check input { width: auto; cursor: pointer; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
        .cancel-btn { background: #f3f4f6; color: #374151; border: none; border-radius: 0.5rem; padding: 0.65rem 1.25rem; cursor: pointer; font-weight: 600; }
        .save-btn { background: #6366f1; color: white; border: none; border-radius: 0.5rem; padding: 0.65rem 1.5rem; cursor: pointer; font-weight: 600; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Media Queries */
        @media (max-width: 1024px) {
          .items-panel { margin: 1rem; }
          .filters { padding: 1rem; }
        }

        @media (max-width: 768px) {
          .topbar { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 1rem; }
          .add-btn { width: 100%; text-align: center; }
          .filters { flex-direction: column; align-items: stretch; }
          .search-input { width: 100%; }
          .items-panel { border-radius: 0; border-left: none; border-right: none; margin: 0; }
          .items-table { display: block; overflow-x: auto; white-space: nowrap; }
          .modal { max-width: 95%; margin: 10px; }
        }

        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
          .modal-body { padding: 1rem; }
          .modal-footer { padding: 0.75rem 1rem; }
        }
      `}</style>
    </>
  );
}
