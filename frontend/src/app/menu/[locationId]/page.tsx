'use client';
// src/app/menu/[locationId]/page.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { foodApi, locationApi } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { FoodItem, MenuGroup, Location } from '@/types';

export default function MenuPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const router = useRouter();
  const { items: cartItems, addItem, removeItem, updateQuantity, location, table, totalItems, totalAmount } = useCartStore();

  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [location_, setLocation_] = useState<Location | null>(location);
  const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!location || !table) {
      router.push('/');
      return;
    }
    async function loadMenu() {
      try {
        const menu = await foodApi.getMenu(locationId);
        setMenuGroups(menu);
        if (menu.length > 0) setActiveCategoryId('all');
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [locationId]);

  const getCartQuantity = (foodItemId: number) =>
    cartItems.find(i => i.foodItem.id === foodItemId)?.quantity || 0;

  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(group => {
    const matchesCategory = activeCategoryId === 'all' || group.category.id === activeCategoryId;
    return matchesCategory && group.items.length > 0;
  });

  if (loading) return <LoadingMenuScreen />;

  return (
    <div className="menu-page">
      {/* Header */}
      <header className="menu-header">
        <div className="header-info">
          <h1>{location?.name || 'Restaurant'}</h1>
          <span className="table-badge">🪑 Table {table?.tableNumber}</span>
        </div>
        <button className="cart-trigger" onClick={() => setShowCart(true)}>
          🛒 <span className="cart-count">{totalItems()}</span>
          <span className="cart-total">₹{totalAmount().toFixed(0)}</span>
        </button>
      </header>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search dishes..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`cat-tab ${activeCategoryId === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategoryId('all')}
        >
          🍽️ All
        </button>
        {menuGroups.map(group => (
          <button
            key={group.category.id}
            className={`cat-tab ${activeCategoryId === group.category.id ? 'active' : ''}`}
            onClick={() => setActiveCategoryId(group.category.id)}
          >
            {group.category.icon} {group.category.name}
          </button>
        ))}
      </div>

      {/* Menu Groups */}
      <main className="menu-content">
        {filteredGroups.map(group => (
          <section key={group.category.id} className="menu-section">
            <div className="section-header">
              <span className="section-icon">{group.category.icon}</span>
              <h2>{group.category.name}</h2>
              <span className="item-count">{group.items.length} items</span>
            </div>
            <div className="food-grid">
              {group.items.map(item => (
                <FoodCard
                  key={item.id}
                  item={item}
                  quantity={getCartQuantity(item.id)}
                  onAdd={() => addItem(item)}
                  onRemove={() => {
                    const qty = getCartQuantity(item.id);
                    if (qty <= 1) removeItem(item.id);
                    else updateQuantity(item.id, qty - 1);
                  }}
                  onIncrease={() => updateQuantity(item.id, getCartQuantity(item.id) + 1)}
                />
              ))}
            </div>
          </section>
        ))}
        {filteredGroups.length === 0 && (
          <div className="empty-state">
            <p>No items found{searchTerm ? ` for "${searchTerm}"` : ''}</p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems() > 0 && (
        <div className="floating-cart" onClick={() => setShowCart(true)}>
          <span>{totalItems()} items</span>
          <span>View Cart →</span>
          <span>₹{totalAmount().toFixed(0)}</span>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <CartDrawer
          onClose={() => setShowCart(false)}
          onOrder={() => { setShowCart(false); router.push('/checkout'); }}
        />
      )}

      <style jsx>{`
        .menu-page {
          min-height: 100vh;
          background: #fdf6ec;
          font-family: 'Georgia', serif;
          padding-bottom: 6rem;
        }
        .menu-header {
          background: #1a0a00;
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .header-info h1 { font-size: 1.1rem; color: #f5a623; margin: 0 0 0.2rem; }
        .table-badge { background: rgba(245,166,35,0.2); color: #f5a623; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.8rem; }
        .cart-trigger {
          background: #f5a623;
          color: #1a0a00;
          border: none;
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cart-count { background: #1a0a00; color: #f5a623; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; }
        .search-bar { padding: 1rem 1.5rem; background: white; border-bottom: 1px solid #f0e8d8; }
        .search-bar input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e0d4bc;
          border-radius: 2rem;
          font-size: 0.95rem;
          background: #fdf6ec;
          outline: none;
        }
        .category-tabs {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 1rem 1.5rem;
          background: white;
          border-bottom: 2px solid #f0e8d8;
          scrollbar-width: none;
        }
        .cat-tab {
          white-space: nowrap;
          padding: 0.5rem 1rem;
          border: 1px solid #e0d4bc;
          border-radius: 2rem;
          background: transparent;
          cursor: pointer;
          font-size: 0.85rem;
          color: #5a3e28;
          transition: all 0.2s;
        }
        .cat-tab.active { background: #1a0a00; color: #f5a623; border-color: #1a0a00; }
        .menu-content { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
        .menu-section { margin-bottom: 2.5rem; }
        .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f0e8d8; }
        .section-icon { font-size: 1.5rem; }
        .section-header h2 { font-size: 1.25rem; color: #1a0a00; margin: 0; flex: 1; }
        .item-count { color: #a07850; font-size: 0.8rem; }
        .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .empty-state { text-align: center; padding: 4rem; color: #a07850; }
        .floating-cart {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: #1a0a00;
          color: #f5a623;
          padding: 1rem 2rem;
          border-radius: 3rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          font-weight: bold;
          z-index: 50;
          min-width: 280px;
          justify-content: space-between;
        }
        .floating-cart:hover { background: #2d1200; }
      `}</style>
    </div>
  );
}

function FoodCard({ item, quantity, onAdd, onRemove, onIncrease }: {
  item: FoodItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="food-card">
      <div className="card-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="image-placeholder">🍽️</div>
        )}
        <span className={`veg-badge ${item.isVeg ? 'veg' : 'nonveg'}`}>
          {item.isVeg ? '🟢' : '🔴'}
        </span>
      </div>
      <div className="card-body">
        <h3>{item.name}</h3>
        {item.description && <p className="desc">{item.description}</p>}
        <div className="card-footer">
          <span className="price">₹{item.price}</span>
          <div className="qty-control">
            {quantity === 0 ? (
              <button className="add-btn" onClick={onAdd}>+ Add</button>
            ) : (
              <div className="stepper">
                <button onClick={onRemove}>−</button>
                <span>{quantity}</span>
                <button onClick={onIncrease}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .food-card { background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
        .food-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
        .card-image { height: 140px; background: #f5ede0; position: relative; overflow: hidden; }
        .card-image img { width: 100%; height: 100%; object-fit: cover; }
        .image-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
        .veg-badge { position: absolute; top: 0.5rem; left: 0.5rem; font-size: 0.9rem; background: white; border-radius: 4px; padding: 2px; }
        .card-body { padding: 0.75rem 1rem 1rem; }
        h3 { font-size: 0.95rem; font-weight: bold; color: #1a0a00; margin: 0 0 0.25rem; line-height: 1.3; }
        .desc { font-size: 0.78rem; color: #a07850; margin: 0 0 0.75rem; line-height: 1.4; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; }
        .price { font-weight: bold; color: #1a0a00; font-size: 1rem; }
        .add-btn { background: #1a0a00; color: #f5a623; border: none; border-radius: 1.5rem; padding: 0.4rem 1rem; cursor: pointer; font-weight: bold; font-size: 0.85rem; }
        .add-btn:hover { background: #2d1200; }
        .stepper { display: flex; align-items: center; gap: 0.5rem; background: #1a0a00; border-radius: 1.5rem; padding: 0.25rem; }
        .stepper button { background: transparent; border: none; color: #f5a623; cursor: pointer; width: 24px; height: 24px; border-radius: 50%; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
        .stepper button:hover { background: rgba(245,166,35,0.2); }
        .stepper span { color: white; min-width: 20px; text-align: center; font-weight: bold; font-size: 0.9rem; }
      `}</style>
    </div>
  );
}

function CartDrawer({ onClose, onOrder }: { onClose: () => void; onOrder: () => void }) {
  const { items, updateQuantity, removeItem, totalAmount, table, location } = useCartStore();

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Your Order</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="drawer-info">
          <span>📍 {location?.name}</span>
          <span>🪑 Table {table?.tableNumber}</span>
        </div>
        <div className="drawer-items">
          {items.map(cartItem => (
            <div key={cartItem.foodItem.id} className="cart-item">
              <div className="item-info">
                <span className="item-veg">{cartItem.foodItem.isVeg ? '🟢' : '🔴'}</span>
                <span className="item-name">{cartItem.foodItem.name}</span>
              </div>
              <div className="item-controls">
                <div className="mini-stepper">
                  <button onClick={() => updateQuantity(cartItem.foodItem.id, cartItem.quantity - 1)}>−</button>
                  <span>{cartItem.quantity}</span>
                  <button onClick={() => updateQuantity(cartItem.foodItem.id, cartItem.quantity + 1)}>+</button>
                </div>
                <span className="item-price">₹{(cartItem.foodItem.price * cartItem.quantity).toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="drawer-footer">
          <div className="total-row">
            <span>Total Amount</span>
            <span className="total-amount">₹{totalAmount().toFixed(2)}</span>
          </div>
          <button className="order-btn" onClick={onOrder}>
            Proceed to Book Order →
          </button>
        </div>
      </div>
      <style jsx>{`
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; justify-content: flex-end; }
        .drawer { width: min(420px, 100vw); background: white; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; }
        .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid #f0e8d8; }
        .drawer-header h2 { font-size: 1.25rem; color: #1a0a00; margin: 0; }
        .drawer-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #5a3e28; }
        .drawer-info { display: flex; gap: 1rem; padding: 0.75rem 1.5rem; background: #fdf6ec; font-size: 0.85rem; color: #5a3e28; border-bottom: 1px solid #f0e8d8; }
        .drawer-items { flex: 1; padding: 1rem 1.5rem; overflow-y: auto; }
        .cart-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f5ede0; }
        .item-info { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
        .item-name { font-size: 0.9rem; color: #1a0a00; }
        .item-controls { display: flex; align-items: center; gap: 1rem; }
        .mini-stepper { display: flex; align-items: center; gap: 0.5rem; border: 1px solid #e0d4bc; border-radius: 1.5rem; padding: 0.2rem 0.5rem; }
        .mini-stepper button { background: none; border: none; cursor: pointer; color: #1a0a00; font-size: 1rem; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
        .mini-stepper span { font-weight: bold; min-width: 20px; text-align: center; font-size: 0.9rem; }
        .item-price { font-weight: bold; color: #1a0a00; min-width: 50px; text-align: right; }
        .drawer-footer { padding: 1.5rem; border-top: 2px solid #f0e8d8; background: white; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 1rem; }
        .total-amount { font-weight: bold; font-size: 1.2rem; color: #1a0a00; }
        .order-btn { width: 100%; background: linear-gradient(135deg, #f5a623, #e07b00); color: #1a0a00; border: none; border-radius: 2rem; padding: 1rem; font-weight: bold; font-size: 1rem; cursor: pointer; }
      `}</style>
    </div>
  );
}

function LoadingMenuScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>🍽️</div>
      <p style={{ fontFamily: 'Georgia', color: '#5a3e28' }}>Loading menu...</p>
    </div>
  );
}
