'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface HomeSlider {
  id: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export default function HomeSlidersPage() {
  const [sliders, setSliders] = useState<HomeSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { token } = useAuthStore();

  const [newSlider, setNewSlider] = useState({
    title: '',
    subtitle: '',
    linkUrl: '',
    sortOrder: 0,
    file: null as File | null
  });

  useEffect(() => {
    fetchSliders();
  }, []);

  async function fetchSliders() {
    setLoading(true);
    try {
      const res = await api.get('/home-sliders');
      setSliders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlider.file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', newSlider.file);
    if (newSlider.title) formData.append('title', newSlider.title);
    if (newSlider.subtitle) formData.append('subtitle', newSlider.subtitle);
    if (newSlider.linkUrl) formData.append('linkUrl', newSlider.linkUrl);
    formData.append('sortOrder', String(newSlider.sortOrder));

    try {
      await api.post('/home-sliders/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setShowAddModal(false);
      setNewSlider({ title: '', subtitle: '', linkUrl: '', sortOrder: 0, file: null });
      fetchSliders();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this slider?')) return;
    try {
      await api.delete(`/home-sliders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSliders();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Home Sliders</h1>
          <p className="text-slate-500 font-medium mt-1">Manage promotional banners for the mobile app home screen</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} strokeWidth={3} />
          Add New Slider
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slider) => (
            <div key={slider.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[16/6] bg-slate-100 relative group">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${slider.imageUrl}`} 
                  alt={slider.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => handleDelete(slider.id)}
                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{slider.title || 'No Title'}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">{slider.subtitle || 'No Subtitle'}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                    Order: {slider.sortOrder}
                  </span>
                </div>
                {slider.linkUrl && (
                  <div className="mt-3 truncate text-indigo-600 text-xs font-bold bg-indigo-50 px-3 py-2 rounded-lg">
                    Link: {slider.linkUrl}
                  </div>
                )}
              </div>
            </div>
          ))}
          {sliders.length === 0 && (
            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <ImageIcon size={40} className="text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">No sliders found</h2>
              <p className="text-slate-500 mt-1 max-w-xs">Add your first promotional banner to make your mobile app dynamic and engaging.</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Create New Slider</h2>
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Slider Image (1600x600 recommended)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={(e) => setNewSlider({ ...newSlider, file: e.target.files?.[0] || null })}
                      className="hidden" 
                      id="file-upload"
                      accept="image/*"
                      required
                    />
                    <label 
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      {newSlider.file ? (
                        <div className="flex items-center gap-2 text-indigo-600 font-bold">
                          <ImageIcon size={20} />
                          <span>{newSlider.file.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon size={32} className="text-slate-300 mb-2" />
                          <span className="text-sm font-bold text-slate-500">Pick an image</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title (Optional)</label>
                    <input 
                      type="text" 
                      value={newSlider.title}
                      onChange={(e) => setNewSlider({ ...newSlider, title: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="e.g. MEGA OFFERS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle (Optional)</label>
                    <input 
                      type="text" 
                      value={newSlider.subtitle}
                      onChange={(e) => setNewSlider({ ...newSlider, subtitle: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="e.g. Up to 50% OFF"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link (Optional)</label>
                    <input 
                      type="text" 
                      value={newSlider.linkUrl}
                      onChange={(e) => setNewSlider({ ...newSlider, linkUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="/menu?tab=promo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sort Order</label>
                    <input 
                      type="number" 
                      value={newSlider.sortOrder}
                      onChange={(e) => setNewSlider({ ...newSlider, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : 'Create Slider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
