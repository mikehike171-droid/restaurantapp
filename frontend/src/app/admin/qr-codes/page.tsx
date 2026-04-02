'use client';
// src/app/admin/qr-codes/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locationApi, qrApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Location } from '@/types';

export default function QrCodesPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [generating, setGenerating] = useState<number | null>(null);
  const [qrData, setQrData] = useState<Record<number, { qrCodeDataUrl: string; scanUrl: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    locationApi.getAll().then(locs => {
      let filtered = locs;
      const role = user?.role?.toLowerCase().replace(/[^a-z]/g, '') || '';
      const allowedBranches = user?.locationIds || [];

      if (role !== 'superadmin' && allowedBranches.length > 0) {
        filtered = locs.filter(l => allowedBranches.includes(l.id));
      } else if (role !== 'superadmin' && allowedBranches.length === 0) {
        filtered = [];
      }
      setLocations(filtered);
      setLoading(false);
    });
  }, [token]);

  async function generateQr(locationId: number) {
    setGenerating(locationId);
    try {
      const data = await qrApi.generate(locationId);
      setQrData(prev => ({ ...prev, [locationId]: data }));
    } finally {
      setGenerating(null);
    }
  }

  function downloadQr(locationId: number, locationName: string) {
    const url = qrApi.getDownloadUrl(locationId);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${locationName.replace(/\s+/g, '-')}.png`;
    a.click();
  }

  if (loading) return <div style={{ padding: '2rem', color: '#6b7280' }}>Loading...</div>;

  return (
    <>
      <main className="admin-main">
        <div className="topbar">
          <h1>📱 QR Code Manager</h1>
          <p className="subtitle">Generate QR codes for each location. Customers scan these to view the menu and order.</p>
        </div>

        <div className="qr-grid">
          {locations.map(loc => {
            const qr = qrData[loc.id];
            const isGenerating = generating === loc.id;

            return (
              <div key={loc.id} className="qr-card">
                <div className="qr-card-header">
                  <div>
                    <h2>{loc.name}</h2>
                    <p>{loc.address}, {loc.city}</p>
                    {loc.phone && <p>📞 {loc.phone}</p>}
                  </div>
                  <div className={`loc-status ${loc.isActive ? 'active' : 'inactive'}`}>
                    {loc.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </div>
                </div>

                <div className="qr-preview">
                  {qr ? (
                    <img src={qr.qrCodeDataUrl} alt={`QR for ${loc.name}`} className="qr-image" />
                  ) : loc.qrCodeUrl ? (
                    <img src={loc.qrCodeUrl} alt={`QR for ${loc.name}`} className="qr-image" />
                  ) : (
                    <div className="qr-placeholder">
                      <span>📱</span>
                      <p>No QR generated yet</p>
                    </div>
                  )}
                </div>

                {(qr?.scanUrl) && (
                  <div className="scan-url">
                    <span>🔗</span>
                    <code>{qr.scanUrl}</code>
                  </div>
                )}

                <div className="qr-token">
                  <span>Token: <code>{loc.qrCodeToken}</code></span>
                </div>

                <div className="qr-actions">
                  <button
                    className="generate-btn"
                    onClick={() => generateQr(loc.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '⏳ Generating...' : '🔄 Generate QR'}
                  </button>
                  {(qr || loc.qrCodeUrl) && (
                    <button className="download-btn" onClick={() => downloadQr(loc.id, loc.name)}>
                      ⬇️ Download
                    </button>
                  )}
                </div>

                <div className="qr-instructions">
                  <strong>How it works:</strong>
                  <ol>
                    <li>Generate the QR code for this location</li>
                    <li>Print and place it on each table</li>
                    <li>Customers scan → Select table → Browse menu → Order!</li>
                  </ol>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <style jsx>{`
        .admin-main { flex: 1; padding: 0; }
        .topbar { padding: 1.5rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; }
        h1 { margin: 0 0 0.25rem; font-size: 1.25rem; font-weight: bold; color: #111827; }
        .subtitle { margin: 0; font-size: 0.875rem; color: #6b7280; }
        .qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.5rem; padding: 2rem; }
        .qr-card { background: white; border-radius: 1rem; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .qr-card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.25rem; border-bottom: 1px solid #f3f4f6; }
        .qr-card-header h2 { margin: 0 0 0.25rem; font-size: 1rem; color: #111827; }
        .qr-card-header p { margin: 0; font-size: 0.8rem; color: #6b7280; }
        .loc-status { padding: 0.3rem 0.65rem; border-radius: 1rem; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
        .loc-status.active { background: #dcfce7; color: #16a34a; }
        .loc-status.inactive { background: #fef2f2; color: #ef4444; }
        .qr-preview { display: flex; justify-content: center; padding: 1.5rem; background: #f9fafb; border-bottom: 1px solid #f3f4f6; min-height: 200px; align-items: center; }
        .qr-image { width: 180px; height: 180px; border: 8px solid white; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .qr-placeholder { text-align: center; color: #9ca3af; }
        .qr-placeholder span { font-size: 3rem; }
        .qr-placeholder p { margin: 0.5rem 0 0; font-size: 0.85rem; }
        .scan-url { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #f0fdf4; border-bottom: 1px solid #f3f4f6; }
        .scan-url code { font-size: 0.75rem; color: #16a34a; word-break: break-all; }
        .qr-token { padding: 0.5rem 1.25rem; font-size: 0.78rem; color: #9ca3af; border-bottom: 1px solid #f3f4f6; }
        .qr-token code { background: #f3f4f6; padding: 0.1rem 0.35rem; border-radius: 0.25rem; }
        .qr-actions { display: flex; gap: 0.75rem; padding: 1rem 1.25rem; }
        .generate-btn { flex: 1; background: #6366f1; color: white; border: none; border-radius: 0.5rem; padding: 0.65rem; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
        .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .download-btn { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.65rem 1rem; cursor: pointer; font-size: 0.85rem; }
        .download-btn:hover { background: #e5e7eb; }
        .qr-instructions { padding: 1rem 1.25rem; background: #fefce8; border-top: 1px solid #fef08a; font-size: 0.8rem; color: #713f12; }
        .qr-instructions strong { display: block; margin-bottom: 0.4rem; }
        .qr-instructions ol { margin: 0; padding-left: 1.25rem; }
        .qr-instructions li { margin-bottom: 0.2rem; line-height: 1.5; }
      `}</style>
    </>
  );
}
