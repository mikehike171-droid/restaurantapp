'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoryApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Category } from '@/types';

export default function CategoriesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', sortOrder: '0' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    loadCategories();
  }, [token]);

  async function loadCategories() {
    try {
      const cats = await categoryApi.getAll();
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditItem(null);
    setForm({ name: '', sortOrder: '0' });
    setSelectedFile(null);
    setPreview(null);
    setShowForm(true);
  }

  function openEditForm(cat: Category) {
    setEditItem(cat);
    setForm({ name: cat.name, sortOrder: String(cat.sortOrder) });
    setSelectedFile(null);
    setPreview(cat.imageUrl ? `http://localhost:5000${cat.imageUrl}` : null);
    setShowForm(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('sortOrder', form.sortOrder);
      if (selectedFile) formData.append('image', selectedFile);

      if (editItem) await categoryApi.update(editItem.id, formData);
      else await categoryApi.create(formData);

      setShowForm(false);
      await loadCategories();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    await categoryApi.delete(id);
    await loadCategories();
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <>
      <main className="admin-main">
        <div className="topbar">
          <div>
            <h1>📂 Category Master</h1>
            <p className="subtitle">Manage food categories and their display order</p>
          </div>
          <button className="add-btn" onClick={openAddForm}>+ Add Category</button>
        </div>

        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="cat-card">
              <div className="cat-image-container">
                {cat.imageUrl ? (
                  <img src={`http://localhost:5000${cat.imageUrl}`} alt={cat.name} className="cat-img" />
                ) : (
                  <div className="cat-icon-fallback">📸</div>
                )}
              </div>
              <div className="cat-info">
                <h3>{cat.name}</h3>
                <p>Order: {cat.sortOrder}</p>
              </div>
              <div className="cat-actions">
                <button onClick={() => openEditForm(cat)}>✏️</button>
                <button onClick={() => handleDelete(cat.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Category Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Biryani" />
              </div>

              <div className="form-group">
                <label>Category Photo *</label>
                <div className="upload-box" onClick={() => document.getElementById('fileInput')?.click()}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="upload-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>📸 Click to upload photo</span>
                    </div>
                  )}
                </div>
                <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              <div className="form-group">
                <label>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={saving || !form.name}>
                {saving ? 'Saving...' : (editItem ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-main { flex: 1; padding: 0; }
        .topbar { padding: 1.5rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
        h1 { margin: 0; font-size: 1.25rem; font-weight: bold; color: #111827; }
        .subtitle { margin: 0.25rem 0 0; font-size: 0.875rem; color: #6b7280; }
        .add-btn { background: #16a34a; color: white; border: none; border-radius: 0.75rem; padding: 0.65rem 1.25rem; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
        
        .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; padding: 2rem; }
        .cat-card { background: white; border-radius: 1rem; border: 1px solid #e5e7eb; padding: 1rem; display: flex; align-items: center; gap: 1rem; position: relative; }
        
        .cat-image-container { width: 60px; height: 60px; border-radius: 0.75rem; overflow: hidden; background: #f3f4f6; flex-shrink: 0; }
        .cat-img { width: 100%; height: 100%; object-fit: cover; }
        .cat-icon-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; }

        .cat-info { flex: 1; }
        .cat-info h3 { margin: 0; font-size: 1rem; color: #111827; }
        .cat-info p { margin: 0.1rem 0 0; font-size: 0.8rem; color: #9ca3af; }
        
        .cat-actions { display: flex; gap: 0.5rem; }
        .cat-actions button { background: none; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.4rem; cursor: pointer; transition: all 0.2s; }
        .cat-actions button:hover { background: #f9fafb; border-color: #6366f1; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
        .modal-header h2 { margin: 0; font-size: 1.1rem; color: #111827; }
        .modal-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
        .form-group input { border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.6rem 0.75rem; font-size: 0.9rem; outline: none; }
        .form-group input:focus { border-color: #16a34a; }
        
        .upload-box { border: 2px dashed #e5e7eb; border-radius: 0.75rem; height: 120px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
        .upload-box:hover { border-color: #16a34a; }
        .upload-preview { width: 100%; height: 100%; object-fit: cover; }
        .upload-placeholder { color: #9ca3af; font-size: 0.85rem; font-weight: 500; }

        .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
        .cancel-btn { background: #f3f4f6; color: #374151; border: none; border-radius: 0.5rem; padding: 0.65rem 1.25rem; cursor: pointer; font-weight: 600; }
        .save-btn { background: #16a34a; color: white; border: none; border-radius: 0.5rem; padding: 0.65rem 1.5rem; cursor: pointer; font-weight: 600; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </>
  );
}
