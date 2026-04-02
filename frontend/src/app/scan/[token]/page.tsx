'use client';
// src/app/scan/[token]/page.tsx
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { locationApi, orderApi } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { Location, RestaurantTable } from '@/types';

export default function ScanPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { setLocation, setTable, clearCart } = useCartStore();
  const [location, setLocationState] = useState<Location | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLocationData() {
      try {
        const loc = await locationApi.getByToken(token);
        setLocationState(loc);
        setLocation(loc);
        clearCart();
        const tbls = await orderApi.getTables(loc.id);
        setTables(tbls.filter((t: RestaurantTable) => t.isAvailable));
      } catch {
        setError('Invalid QR code or location not found');
      } finally {
        setLoading(false);
      }
    }
    loadLocationData();
  }, [token]);

  const handleTableSelect = (table: RestaurantTable) => {
    setSelectedTable(table);
    setTable(table);
  };

  const proceed = () => {
    if (selectedTable) router.push(`/menu/${location!.id}`);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className="scan-page">
      <div className="scan-header">
        <div className="logo">🍽️</div>
        <h1>{location!.name}</h1>
        <p>{location!.address}, {location!.city}</p>
      </div>

      <div className="table-selection">
        <h2>Select Your Table</h2>
        <p>Choose your table number to start ordering</p>
        <div className="tables-grid">
          {tables.map(table => (
            <button
              key={table.id}
              className={`table-btn ${selectedTable?.id === table.id ? 'selected' : ''}`}
              onClick={() => handleTableSelect(table)}
            >
              <span className="table-icon">🪑</span>
              <span className="table-num">Table {table.tableNumber}</span>
              <span className="table-cap">{table.capacity} seats</span>
            </button>
          ))}
        </div>
        {tables.length === 0 && (
          <div className="no-tables">
            <p>No tables available right now. Please check with staff.</p>
          </div>
        )}
      </div>

      {selectedTable && (
        <div className="proceed-section">
          <div className="selected-info">
            <span>✅ Table {selectedTable.tableNumber} selected</span>
          </div>
          <button className="proceed-btn" onClick={proceed}>
            View Menu & Order →
          </button>
        </div>
      )}

      <style jsx>{`
        .scan-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a0a00 0%, #3d1500 50%, #1a0a00 100%);
          color: white;
          font-family: 'Georgia', serif;
          padding: 2rem 1rem;
        }
        .scan-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem;
        }
        .logo { font-size: 4rem; margin-bottom: 1rem; }
        h1 { font-size: 2rem; font-weight: bold; color: #f5a623; margin-bottom: 0.5rem; }
        .scan-header p { color: #d4a373; font-size: 0.95rem; }
        .table-selection {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255,255,255,0.05);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid rgba(245,166,35,0.2);
        }
        h2 { font-size: 1.5rem; color: #f5a623; margin-bottom: 0.5rem; }
        .table-selection > p { color: #d4a373; margin-bottom: 1.5rem; }
        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }
        .table-btn {
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(245,166,35,0.3);
          border-radius: 1rem;
          padding: 1rem 0.5rem;
          cursor: pointer;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.2s;
        }
        .table-btn:hover { background: rgba(245,166,35,0.15); border-color: #f5a623; transform: translateY(-2px); }
        .table-btn.selected { background: rgba(245,166,35,0.25); border-color: #f5a623; box-shadow: 0 0 20px rgba(245,166,35,0.3); }
        .table-icon { font-size: 1.5rem; }
        .table-num { font-weight: bold; font-size: 0.9rem; }
        .table-cap { font-size: 0.75rem; color: #d4a373; }
        .no-tables { text-align: center; padding: 2rem; color: #d4a373; }
        .proceed-section {
          max-width: 600px;
          margin: 2rem auto 0;
          text-align: center;
        }
        .selected-info {
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.3);
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
          color: #4ade80;
        }
        .proceed-btn {
          background: linear-gradient(135deg, #f5a623, #e07b00);
          color: #1a0a00;
          font-weight: bold;
          font-size: 1.1rem;
          padding: 1rem 3rem;
          border: none;
          border-radius: 3rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .proceed-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,166,35,0.4); }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#1a0a00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: '#f5a623' }}>
      <div style={{ fontSize: '3rem' }}>🍽️</div>
      <p style={{ fontFamily: 'Georgia', fontSize: '1.2rem' }}>Loading your dining experience...</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#1a0a00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'white', padding: '2rem' }}>
      <div style={{ fontSize: '3rem' }}>❌</div>
      <p style={{ color: '#ef4444', textAlign: 'center' }}>{message}</p>
    </div>
  );
}
