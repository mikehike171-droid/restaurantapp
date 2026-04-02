'use client';
import { useEffect, useState } from 'react';
import { offerApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function OffersPage() {
  const { token } = useAuthStore();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promoCode: '',
    minAmount: 0,
    discountAmount: 0,
    type: 'fixed',
    isActive: true,
  });

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    try {
      const data = await offerApi.getAll();
      setOffers(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await offerApi.update(editingId, formData);
      } else {
        await offerApi.create(formData);
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      loadOffers();
    } catch (err) {
      alert('Error saving offer');
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      promoCode: '',
      minAmount: 0,
      discountAmount: 0,
      type: 'fixed',
      isActive: true,
    });
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure?')) return;
    await offerApi.delete(id);
    loadOffers();
  }

  function handleEdit(offer: any) {
    setFormData({
      title: offer.title,
      description: offer.description || '',
      promoCode: offer.promoCode,
      minAmount: Number(offer.minAmount),
      discountAmount: Number(offer.discountAmount),
      type: offer.type,
      isActive: offer.isActive,
    });
    setEditingId(offer.id);
    setIsAdding(true);
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Offers</h1>
          <p className="text-gray-500">Manage discounts and seasonal offers</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); resetForm(); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          + Create New Offer
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Offer' : 'New Offer'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
              <input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Festival Special Discount"
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Details of the offer..."
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
              <input 
                value={formData.promoCode}
                onChange={e => setFormData({...formData, promoCode: e.target.value.toUpperCase()})}
                placeholder="FEST100"
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (₹)</label>
              <input 
                type="number"
                value={formData.minAmount}
                onChange={e => setFormData({...formData, minAmount: Number(e.target.value)})}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
              <input 
                type="number"
                value={formData.discountAmount}
                onChange={e => setFormData({...formData, discountAmount: Number(e.target.value)})}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <button 
                type="button"
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold"
              >
                {editingId ? 'Update Offer' : 'Save Offer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-bottom">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Offer Info</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Code</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Condition</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Discount</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offers.map(offer => (
              <tr key={offer.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm">
                  <div className="font-bold text-gray-900">{offer.title}</div>
                  <div className="text-gray-500 text-xs">{offer.description || 'No description'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono text-sm font-bold border border-indigo-100 uppercase">
                    {offer.promoCode}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                  Above ₹{Number(offer.minAmount).toFixed(0)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">
                  {offer.type === 'fixed' ? '₹' : ''}{Number(offer.discountAmount).toFixed(0)}{offer.type === 'percentage' ? '%' : ''} OFF
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {offer.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(offer)} className="text-indigo-600 hover:text-indigo-900 font-bold">Edit</button>
                    <button onClick={() => handleDelete(offer.id)} className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {offers.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No offers created yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
