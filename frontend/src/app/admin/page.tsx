'use client';
// src/app/admin/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locationApi, orderApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Location, Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  waiting: '#3b82f6',
  preparing: '#8b5cf6',
  on_the_way: '#06b6d4',
  delivered: '#10b981',
  eating: '#ec4899',
  payment_due: '#ef4444',
  completed: '#22c55e',
  cancelled: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Order Placed',
  waiting: '🤚 Accepted',
  preparing: '👨‍🍳 Cooking',
  on_the_way: '🚚 On the Way',
  delivered: '🎁 Delivered',
  eating: '🍽️ Customer Eating',
  payment_due: '🧾 Bill Generated',
  completed: '✅ Paid',
  cancelled: '✕ Cancelled',
};

// Action button labels (what the NEXT step will be)
const ACTION_LABELS: Record<string, string> = {
  pending: '✅ Accept Order',
  preparing: '🚚 Mark On the Way',
  on_the_way: '🎁 Mark Delivered',
  delivered: '🍽️ Customer Eating',
  eating: '🧾 Generate Bill',
  payment_due: '💰 Mark as Paid',
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'preparing',
  preparing: 'on_the_way',
  on_the_way: 'delivered',
  delivered: 'eating',
  eating: 'payment_due',
  payment_due: 'completed',
};

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user, selectedLocationId, setSelectedLocation, logout } = useAuthStore();

  const [locations, setLocations] = useState<Location[]>([]);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'all' | 'history'>('live');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [updatingOrder, setUpdatingOrder] = useState<any>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Order | null>(null);
  const [editingOrderDetails, setEditingOrderDetails] = useState<Order | null>(null);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    loadLocations();
  }, [token]);

  useEffect(() => {
    if (selectedLocationId) {
      loadOrders();
      loadStats();
      const interval = setInterval(loadOrders, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [selectedLocationId, activeTab]);

  async function loadLocations() {
    try {
      let locs = await locationApi.getAll();
      
      // Filter locations if user is branch-restricted
      const role = user?.role?.toLowerCase().replace(/[^a-z]/g, '') || '';
      const allowedBranches = user?.locationIds || [];

      if (role !== 'superadmin' && allowedBranches.length > 0) {
        locs = locs.filter(l => allowedBranches.includes(l.id));
      } else if (role !== 'superadmin' && allowedBranches.length === 0) {
        // If they have NO branches assigned and aren't superadmin, they shouldn't see anything
        locs = [];
      }
      
      setLocations(locs);
      
      // Auto-select valid location
      if (locs.length > 0) {
        const isCurrentlySelectedValid = selectedLocationId && locs.some(l => l.id === Number(selectedLocationId));
        if (!isCurrentlySelectedValid) {
          setSelectedLocation(locs[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    if (!selectedLocationId) return;
    try {
      if (activeTab === 'live') {
        const orders = await orderApi.getLive(selectedLocationId);
        setLiveOrders(orders);
      } else if (activeTab === 'all') {
        const orders = await orderApi.getByLocation(selectedLocationId);
        setAllOrders(orders);
      } else {
        const orders = await orderApi.getByLocation(selectedLocationId, 'completed');
        setAllOrders(orders);
      }
    } catch {}
  }

  async function loadStats() {
    if (!selectedLocationId) return;
    try {
      const data = await locationApi.getStats(selectedLocationId);
      setStats(data.stats);
    } catch {}
  }

  async function updateStatus(orderId: number, status: string) {
    setUpdatingOrder(orderId);
    try {
      await orderApi.updateStatus(orderId, status);
      await loadOrders();
      await loadStats(); // Refresh revenue immediately after any status change

    } finally {
      setUpdatingOrder(null);
    }
  }

  async function openEditDetails(order: Order) {
    setEditingOrderDetails(order);
    setCustomerForm({
      name: order.customerName || order.publicUser?.name || '',
      phone: order.customerPhone || order.publicUser?.phone || '',
      address: order.customerAddress || '',
    });
  }

  async function saveCustomerDetails() {
    if (!editingOrderDetails) return;
    setUpdatingOrder(editingOrderDetails.id);
    try {
      await orderApi.updateDetails(editingOrderDetails.id, {
        customerName: customerForm.name,
        customerPhone: customerForm.phone,
        customerAddress: customerForm.address,
      });
      setEditingOrderDetails(null);
      await loadOrders();
    } finally {
      setUpdatingOrder(null);
    }
  }

  const selectedLocation = locations.find(l => l.id === Number(selectedLocationId));

  if (loading) return <AdminLoading />;

  return (
    <>
      {/* Main content */}
      {/* Main */}
      <main className="admin-main">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Dashboard</h1>
            {/* Location Dropdown */}
            <div className="location-select-wrap">
              <span className="loc-icon">📍</span>
              <select
                value={selectedLocationId || ''}
                onChange={e => setSelectedLocation(Number(e.target.value))}
                className="location-select"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="topbar-right">
            <div className="live-badge">🟢 Live</div>
            <span className="refresh-note">Auto-refresh every 15s</span>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <StatCard icon="📋" label="Active Orders" value={stats.active_orders} color="#6366f1" />
            <StatCard icon="🛒" label="Today's Orders" value={stats.today_orders} color="#f59e0b" />
            <StatCard icon="💰" label="Today's Revenue" value={`₹${Number(stats.today_revenue).toFixed(0)}`} color="#10b981" />
            <StatCard icon="🪑" label="Tables Occupied" value={`${stats.occupied_tables}/${stats.total_tables}`} color="#ef4444" />
          </div>
        )}

        {/* Tabs */}
        <div className="orders-panel">
          <div className="tabs">
            <button className={`tab ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>
              🔴 Live Orders {liveOrders.length > 0 && <span className="badge">{liveOrders.length}</span>}
            </button>
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              📋 All Orders
            </button>
            <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              📜 History
            </button>
          </div>

          {/* Live Orders */}
          {activeTab === 'live' && (
            <div className="orders-grid">
              {liveOrders.length === 0 ? (
                <div className="empty-orders">
                  <span>🎉</span>
                  <p>No active orders right now</p>
                </div>
              ) : (
                liveOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={updateStatus}
                    onReceipt={setViewingReceipt}
                    onEditDetails={openEditDetails}
                    updating={updatingOrder === order.id}
                  />
                ))
              )}
            </div>
          )}

          {/* All Orders */}
          {(activeTab === 'all' || activeTab === 'history') && (
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Table</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(order => (
                    <tr key={order.id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td>Table {order.table?.tableNumber}</td>
                      <td>
                        <div className="cust-info">
                          <div className="cust-name">{order.customerName || order.publicUser?.name || 'Walk-in'}</div>
                          {(order.customerPhone || order.publicUser?.phone) && (
                            <div className="cust-phone">{order.customerPhone || order.publicUser?.phone}</div>
                          )}
                          {order.customerAddress && (
                            <div className="cust-address">{order.customerAddress}</div>
                          )}
                        </div>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td>₹{Number(order.totalAmount).toFixed(0)}</td>
                      <td>
                        <span className="status-pill" style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status] }}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="time-cell">{new Date(order.createdAt).toLocaleTimeString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {NEXT_STATUS[order.status] && (
                            <button
                              className="advance-btn"
                              onClick={() => updateStatus(Number(order.id), NEXT_STATUS[order.status])}
                              disabled={updatingOrder === order.id}
                            >
                              → {STATUS_LABELS[NEXT_STATUS[order.status]]}
                            </button>
                          )}
                          <button
                            className="advance-btn"
                            onClick={() => openEditDetails(order)}
                            style={{ background: '#f8fafc', color: '#64748b' }}
                          >
                            ✏️ Edit
                          </button>
                        </div>
                        {(order.status === 'completed' || order.status === 'payment_due') && (
                          <button
                            className="advance-btn receipt"
                            onClick={() => setViewingReceipt(order)}
                            style={{ background: '#f0fdf4', color: '#16a34a' }}
                          >
                            📄 {order.status === 'payment_due' ? 'Bill' : 'Receipt'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allOrders.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Receipt Modal */}
        {viewingReceipt && (
          <div className="modal-overlay" onClick={() => setViewingReceipt(null)}>
            <div className="receipt-modal" onClick={e => e.stopPropagation()}>
              <div className="receipt-header">
                <div className="receipt-brand">RestaurantOS</div>
                <div className="receipt-title">{viewingReceipt.status === 'payment_due' ? 'Table Bill' : 'Payment Receipt'}</div>
                <button className="close-receipt" onClick={() => setViewingReceipt(null)}>✕</button>
              </div>
              
              <div className="receipt-body">
                <div className="receipt-info-row">
                  <span>Order #:</span>
                  <strong>{viewingReceipt.orderNumber}</strong>
                </div>
                <div className="receipt-info-row">
                  <span>Date:</span>
                  <span>{new Date(viewingReceipt.createdAt).toLocaleString()}</span>
                </div>
                <div className="receipt-info-row">
                  <span>Table:</span>
                  <strong>Table {viewingReceipt.table?.tableNumber}</strong>
                </div>
                <hr />
                <div className="receipt-info-row">
                  <span>Customer:</span>
                  <span>{viewingReceipt.customerName || 'Walk-in'}</span>
                </div>
                {viewingReceipt.customerPhone && (
                  <div className="receipt-info-row">
                    <span>Phone:</span>
                    <span>{viewingReceipt.customerPhone}</span>
                  </div>
                )}
                {viewingReceipt.customerAddress && (
                  <div className="receipt-info-row">
                    <span>Address:</span>
                    <span>{viewingReceipt.customerAddress}</span>
                  </div>
                )}
                
                <div className="receipt-items">
                  <div className="ritem-header">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Total</span>
                  </div>
                  {viewingReceipt.items?.map((item, idx) => (
                    <div key={idx} className="ritem">
                      <span>{item.foodItem?.name || `Item #${idx + 1}`}</span>
                      <span>{item.quantity}</span>
                      <span>₹{Number(item.totalPrice).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                
                <hr />
                <div className="receipt-total-row">
                  <span>Total Amount</span>
                  <span>₹{Number(viewingReceipt.totalAmount).toFixed(0)}</span>
                </div>
                <div className="receipt-footer">
                  <p>Thank you for dining with us!</p>
                  <p>Visit again soon.</p>
                </div>
              </div>
              
              <div className="receipt-actions">
                <button className="print-btn" onClick={() => window.print()}>🖨️ Print Receipt</button>
                {viewingReceipt.status === 'payment_due' && (
                  <button 
                    className="pay-btn" 
                    onClick={() => {
                      updateStatus(Number(viewingReceipt.id), 'completed');
                      setViewingReceipt(null);
                    }}
                    disabled={updatingOrder === viewingReceipt.id}
                  >
                    💰 Record Payment (Mark as Paid)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Details Modal */}
        {editingOrderDetails && (
          <div className="modal-overlay" onClick={() => setEditingOrderDetails(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2>Edit Customer Details</h2>
                <button className="close-btn" onClick={() => setEditingOrderDetails(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div className="form-group">
                  <label>Customer Phone</label>
                  <input
                    type="text"
                    value={customerForm.phone}
                    onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="Enter phone"
                  />
                </div>
                <div className="form-group">
                  <label>Customer Address</label>
                  <textarea
                    value={customerForm.address}
                    onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setEditingOrderDetails(null)}>Cancel</button>
                <button className="save-btn" onClick={saveCustomerDetails} disabled={updatingOrder === editingOrderDetails.id}>
                  {updatingOrder === editingOrderDetails.id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        /* Previous styles + new modal styles */
        .receipt-modal { background: white; width: 100%; max-width: 380px; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; overflow: hidden; }
        .receipt-header { background: #f8fafc; padding: 1.5rem; text-align: center; border-bottom: 1px dashed #e2e8f0; }
        .receipt-brand { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; }
        .receipt-title { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
        .close-receipt { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
        
        .receipt-body { padding: 1.5rem; }
        .receipt-info-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.25rem 0; color: #334155; }
        hr { border: none; border-top: 1px dashed #e2e8f0; margin: 1rem 0; }
        
        .receipt-items { margin: 1rem 0; }
        .ritem-header { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
        .ritem { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0; color: #1e293b; }
        
        .receipt-total-row { display: flex; justify-content: space-between; align-items: center; font-size: 1.15rem; font-weight: 800; color: #1e293b; padding-top: 0.5rem; }
        .receipt-footer { margin-top: 2rem; text-align: center; color: #94a3b8; font-size: 0.75rem; }
        .receipt-footer p { margin: 0.1rem 0; }
        
        .receipt-actions { padding: 1.5rem; border-top: 1px solid #f1f5f9; }
        .print-btn:hover { background: #0f172a; }
        .pay-btn { width: 100%; background: #16a34a; color: white; border: none; padding: 0.85rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: background 0.2s; margin-top: 0.75rem; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.2); }
        .pay-btn:hover { background: #15803d; }
        .pay-btn:disabled { opacity: 0.5; }

        @media print {
          .admin-sidebar, .topbar, .stats-grid, .orders-panel, .receipt-actions, .close-receipt { display: none !important; }
          .modal-overlay { background: transparent !important; position: absolute !important; }
          .receipt-modal { box-shadow: none !important; border: 1px solid #eee !important; width: 100% !important; max-width: 100% !important; }
        }
        .admin-main { flex: 1; overflow-x: hidden; }
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; }
        .topbar-left { display: flex; align-items: center; gap: 1.5rem; }
        h1 { margin: 0; font-size: 1.25rem; font-weight: bold; color: #111827; }
        .location-select-wrap { display: flex; align-items: center; gap: 0.5rem; background: #f3f4f6; border-radius: 0.75rem; padding: 0.4rem 0.75rem; }
        .loc-icon { font-size: 1rem; }
        .location-select { border: none; background: transparent; font-size: 0.9rem; color: #374151; cursor: pointer; outline: none; font-weight: 600; min-width: 180px; }
        .topbar-right { display: flex; align-items: center; gap: 1rem; }
        .live-badge { background: #dcfce7; color: #16a34a; padding: 0.3rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; }
        .refresh-note { font-size: 0.75rem; color: #9ca3af; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; padding: 1.5rem 2rem; }
        .orders-panel { margin: 0 2rem 2rem; background: white; border-radius: 1rem; border: 1px solid #e5e7eb; overflow: hidden; }
        .tabs { display: flex; border-bottom: 1px solid #e5e7eb; }
        .tab { padding: 1rem 1.5rem; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; color: #6b7280; font-weight: 500; border-bottom: 2px solid transparent; margin-bottom: -1px; display: flex; align-items: center; gap: 0.5rem; }
        .tab.active { color: #6366f1; border-bottom-color: #6366f1; }
        .badge { background: #ef4444; color: white; border-radius: 1rem; padding: 0 0.4rem; font-size: 0.7rem; min-width: 18px; text-align: center; }
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; padding: 1.5rem; }
        .empty-orders { grid-column: 1/-1; text-align: center; padding: 4rem; color: #9ca3af; font-size: 2rem; }
        .empty-orders p { font-size: 1rem; margin-top: 0.5rem; }
        .orders-table-wrap { overflow-x: auto; }
        .orders-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .orders-table th { background: #f9fafb; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; }
        .orders-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
        .orders-table tr:hover td { background: #f9fafb; }
        .status-pill { padding: 0.3rem 0.75rem; border-radius: 1rem; font-size: 0.78rem; font-weight: 600; }
        .time-cell { color: #9ca3af; font-size: 0.8rem; }
        .advance-btn { background: #ede9fe; color: #6d28d9; border: none; padding: 0.35rem 0.75rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.78rem; white-space: nowrap; }
        .advance-btn:hover { background: #ddd6fe; }
        .advance-btn:disabled { opacity: 0.5; }
        .cust-info { display: flex; flex-direction: column; gap: 0.1rem; }
        .cust-name { font-weight: 700; color: #1e293b; }
        .cust-phone { font-size: 0.75rem; color: #64748b; }
        .cust-address { font-size: 0.75rem; color: #94a3b8; font-style: italic; }
        .oc-customer-box { margin-bottom: 0.75rem; background: #f8fafc; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #f1f5f9; position: relative; }
        .oc-cname { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
        .oc-cphone { font-size: 0.75rem; color: #64748b; margin-top: 0.1rem; }
        .oc-caddress { font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; font-style: italic; }
        .oc-edit-link { display: block; font-size: 0.7rem; color: #6366f1; background: none; border: none; cursor: pointer; padding: 0; margin-top: 0.2rem; text-decoration: underline; }
        .reg-badge { position: absolute; top: 0.5rem; right: 0.5rem; font-size: 0.6rem; background: #dcfce7; color: #16a34a; padding: 0.1rem 0.3rem; border-radius: 0.25rem; font-weight: 800; text-transform: uppercase; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal-content { background: white; width: 100%; border-radius: 1rem; overflow: hidden; }
        .modal-header { padding: 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .modal-header h2 { font-size: 1.15rem; font-weight: 700; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }
        .modal-body { padding: 1.25rem; }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
        .form-group input, .form-group textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.75rem; font-size: 0.9rem; outline: none; }
        .form-group input:focus, .form-group textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .modal-footer { padding: 1.25rem; background: #f8fafc; display: flex; justify-content: flex-end; gap: 0.75rem; }
        .cancel-btn { padding: 0.6rem 1.25rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-weight: 600; background: white; cursor: pointer; }
        .save-btn { padding: 0.6rem 1.25rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: any; color: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e5e7eb', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, onReceipt, onEditDetails, updating }: { order: Order; onUpdateStatus: (id: number, status: string) => void; onReceipt: (order: Order) => void; onEditDetails: (order: Order) => void; updating: boolean }) {
  const nextStatus = NEXT_STATUS[order.status];
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

  return (
    <div className="order-card" style={{ borderTop: `4px solid ${STATUS_COLORS[order.status]}` }}>
      <div className="oc-header">
        <div>
          <div className="oc-number">#{order.orderNumber}</div>
          <div className="oc-table">🪑 Table {order.table?.tableNumber}</div>
        </div>
        <div className="oc-right">
          <span className="oc-status" style={{ color: STATUS_COLORS[order.status] }}>{STATUS_LABELS[order.status]}</span>
          <span className="oc-time">{elapsed}m ago</span>
          <button className="oc-edit-link" onClick={() => onEditDetails(order)}>Edit Details</button>
        </div>
      </div>

      {order.table && <div className="oc-table">🪑 Table {order.table.tableNumber}</div>}
      
      <div className="oc-customer-box">
        <div className="oc-cname">👤 {order.customerName || order.publicUser?.name || 'Walk-in'}</div>
        {order.customerPhone || order.publicUser?.phone ? (
          <div className="oc-cphone">📞 {order.customerPhone || order.publicUser?.phone}</div>
        ) : null}
        {order.customerAddress && (
          <div className="oc-caddress">📍 {order.customerAddress}</div>
        )}
        {order.publicUser && <span className="reg-badge">Registered</span>}
      </div>

      <div className="oc-items">
        {order.items?.map((item, i) => (
          <div key={i} className="oc-item">
            <span className="oc-qty">{item.quantity}×</span>
            <span className="oc-iname">{item.foodItem?.name || `Item #${i + 1}`}</span>
            <span className="oc-iprice">₹{Number(item.totalPrice).toFixed(0)}</span>
          </div>
        ))}
      </div>

      <div className="oc-footer">
        <span className="oc-total">₹{Number(order.totalAmount).toFixed(0)}</span>
        {nextStatus && (
          <button
            className="oc-action"
            style={{ background: STATUS_COLORS[nextStatus] + '22', color: STATUS_COLORS[nextStatus], borderColor: STATUS_COLORS[nextStatus] + '44' }}
            onClick={() => onUpdateStatus(Number(order.id), nextStatus)}
            disabled={updating}
          >
            {updating ? '⏳ Updating...' : (ACTION_LABELS[order.status] || `→ ${STATUS_LABELS[nextStatus]}`)}
          </button>
        )}
        {(order.status === 'completed' || order.status === 'payment_due') && (
          <button
            className="oc-action receipt"
            onClick={() => onReceipt(order)}
            style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}
          >
            📄 {order.status === 'payment_due' ? 'View Bill' : 'Receipt'}
          </button>
        )}
        {['on_the_way', 'preparing', 'waiting', 'payment_due', 'delivered', 'eating', 'pending'].includes(order.status) && (
          <button
            className="oc-action cancel"
            onClick={() => onUpdateStatus(Number(order.id), 'cancelled')}
            disabled={updating}
          >
            ✕ Cancel
          </button>
        )}
      </div>

      <style jsx>{`
        .order-card { background: white; border-radius: 0.75rem; padding: 1rem; border: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .oc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .oc-number { font-weight: bold; font-size: 0.95rem; color: #111827; }
        .oc-table { font-size: 0.8rem; color: #6b7280; margin-top: 0.2rem; }
        .oc-right { text-align: right; }
        .oc-status { display: block; font-size: 0.8rem; font-weight: 600; }
        .oc-time { font-size: 0.75rem; color: #9ca3af; }
        .oc-customer { font-size: 0.82rem; color: #6b7280; margin-bottom: 0.75rem; background: #f9fafb; padding: 0.3rem 0.5rem; border-radius: 0.35rem; }
        .oc-items { border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; padding: 0.5rem 0; margin-bottom: 0.75rem; }
        .oc-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.2rem 0; font-size: 0.82rem; }
        .oc-qty { background: #f3f4f6; border-radius: 0.25rem; padding: 0.1rem 0.35rem; font-weight: bold; color: #374151; }
        .oc-iname { flex: 1; color: #374151; }
        .oc-iprice { color: #6b7280; }
        .oc-footer { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .oc-total { font-weight: bold; color: #111827; font-size: 1rem; }
        .oc-action { padding: 0.4rem 0.75rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; font-weight: 600; border: 1px solid; transition: opacity 0.2s; }
        .oc-action:disabled { opacity: 0.5; cursor: not-allowed; }
        .oc-action.cancel { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }
      `}</style>
    </div>
  );
}

function AdminLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: '#6b7280' }}>
      <div style={{ fontSize: '3rem' }}>🍽️</div>
      <p>Loading admin panel...</p>
    </div>
  );
}
