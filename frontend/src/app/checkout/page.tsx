'use client';
// src/app/checkout/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { orderApi } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, location, table, totalAmount, clearCart } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  if (!location || !table || items.length === 0) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  const handleBookOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        locationId: location.id,
        tableId: table.id,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: notes || undefined,
        items: items.map(i => ({
          foodItemId: i.foodItem.id,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
        })),
      };
      const order = await orderApi.place(payload);
      setOrderId(order.id);
      setOrderNumber(order.orderNumber);
      clearCart();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderNumber) {
    return <OrderSuccess orderNumber={orderNumber} table={table.tableNumber} />;
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <button onClick={() => router.back()} className="back-btn">← Back</button>
        <h1>Confirm Order</h1>
      </header>

      <main className="checkout-content">
        {/* Order Summary */}
        <section className="summary-card">
          <h2>📋 Order Summary</h2>
          <div className="summary-meta">
            <span>📍 {location.name}</span>
            <span>🪑 Table {table.tableNumber}</span>
          </div>
          <div className="order-items">
            {items.map(cartItem => (
              <div key={cartItem.foodItem.id} className="order-row">
                <div className="order-item-left">
                  <span>{cartItem.foodItem.isVeg ? '🟢' : '🔴'}</span>
                  <span className="order-name">{cartItem.foodItem.name}</span>
                  <span className="order-qty">× {cartItem.quantity}</span>
                </div>
                <span className="order-price">₹{(cartItem.foodItem.price * cartItem.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="total-section">
            <div className="total-row">
              <span>Subtotal</span>
              <span>₹{totalAmount().toFixed(2)}</span>
            </div>
            <div className="total-row grand">
              <span>Total</span>
              <span>₹{totalAmount().toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Customer Details */}
        <section className="customer-card">
          <h2>👤 Your Details <span className="optional">(Optional)</span></h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>
          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any dietary restrictions, allergy notes..."
              rows={3}
            />
          </div>
        </section>

        {error && (
          <div className="error-msg">⚠️ {error}</div>
        )}

        <button
          className="book-btn"
          onClick={handleBookOrder}
          disabled={loading}
        >
          {loading ? '⏳ Placing Order...' : `🍽️ Book Order · ₹${totalAmount().toFixed(0)}`}
        </button>
      </main>

      <style jsx>{`
        .checkout-page { min-height: 100vh; background: #fdf6ec; font-family: 'Georgia', serif; }
        .checkout-header { background: #1a0a00; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; color: white; }
        .back-btn { background: none; border: none; color: #f5a623; cursor: pointer; font-size: 0.9rem; }
        h1 { color: #f5a623; font-size: 1.2rem; margin: 0; }
        .checkout-content { max-width: 600px; margin: 0 auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .summary-card, .customer-card { background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        h2 { font-size: 1rem; color: #1a0a00; margin: 0 0 1rem; }
        .summary-meta { display: flex; gap: 1rem; font-size: 0.85rem; color: #a07850; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f0e8d8; }
        .order-items { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .order-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f5ede0; }
        .order-item-left { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
        .order-name { font-size: 0.9rem; color: #1a0a00; }
        .order-qty { color: #a07850; font-size: 0.85rem; }
        .order-price { font-weight: bold; color: #1a0a00; }
        .total-section { border-top: 2px solid #f0e8d8; padding-top: 1rem; }
        .total-row { display: flex; justify-content: space-between; padding: 0.25rem 0; color: #5a3e28; }
        .total-row.grand { font-size: 1.1rem; font-weight: bold; color: #1a0a00; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #f0e8d8; }
        .optional { color: #a07850; font-size: 0.8rem; font-weight: normal; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; font-size: 0.85rem; color: #5a3e28; margin-bottom: 0.4rem; }
        input, textarea { width: 100%; padding: 0.75rem; border: 1px solid #e0d4bc; border-radius: 0.5rem; font-size: 0.9rem; background: #fdf6ec; font-family: inherit; outline: none; box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #f5a623; }
        .error-msg { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; padding: 1rem; border-radius: 0.75rem; font-size: 0.9rem; }
        .book-btn {
          background: linear-gradient(135deg, #f5a623, #e07b00);
          color: #1a0a00;
          border: none;
          border-radius: 2rem;
          padding: 1.1rem 2rem;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          width: 100%;
          font-family: inherit;
          transition: transform 0.2s, opacity 0.2s;
        }
        .book-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .book-btn:not(:disabled):hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
}

function OrderSuccess({ orderNumber, table }: { orderNumber: string; table: string }) {
  const router = useRouter();
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Order Placed!</h1>
        <div className="order-details">
          <div className="detail-row">
            <span>Order Number</span>
            <strong>#{orderNumber}</strong>
          </div>
          <div className="detail-row">
            <span>Table</span>
            <strong>Table {table}</strong>
          </div>
        </div>
        <p>Your order has been received. Our team will serve you shortly.</p>
        <div className="status-track">
          <div className="status-step active">✓ Received</div>
          <div className="status-arrow">→</div>
          <div className="status-step">Preparing</div>
          <div className="status-arrow">→</div>
          <div className="status-step">Ready</div>
          <div className="status-arrow">→</div>
          <div className="status-step">Served</div>
        </div>
        <button onClick={() => router.push('/')} className="home-btn">Back to Home</button>
      </div>
      <style jsx>{`
        .success-page { min-height: 100vh; background: linear-gradient(135deg, #1a0a00, #3d1500); display: flex; align-items: center; justify-content: center; padding: 2rem; font-family: 'Georgia', serif; }
        .success-card { background: white; border-radius: 1.5rem; padding: 2.5rem; max-width: 480px; width: 100%; text-align: center; }
        .success-icon { font-size: 4rem; margin-bottom: 1rem; }
        h1 { color: #1a0a00; font-size: 1.75rem; margin-bottom: 1.5rem; }
        .order-details { background: #fdf6ec; border-radius: 0.75rem; padding: 1rem 1.5rem; margin-bottom: 1.5rem; }
        .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; color: #5a3e28; }
        p { color: #a07850; margin-bottom: 1.5rem; }
        .status-track { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .status-step { padding: 0.4rem 0.75rem; border: 1px solid #e0d4bc; border-radius: 1.5rem; font-size: 0.75rem; color: #a07850; }
        .status-step.active { background: #1a0a00; color: #f5a623; border-color: #1a0a00; }
        .status-arrow { color: #e0d4bc; }
        .home-btn { background: #1a0a00; color: #f5a623; border: none; border-radius: 2rem; padding: 0.75rem 2rem; cursor: pointer; font-size: 0.95rem; }
      `}</style>
    </div>
  );
}
