'use client';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main-wrapper">
        <header className="mobile-header">
          <div className="mobile-header-left">
            <span className="mobile-brand">🍽️ RestaurantOS</span>
          </div>
          <button className="mobile-menu-btn" onClick={() => {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay') as HTMLElement;
            if (sidebar) {
              sidebar.classList.toggle('show-mobile');
              if (overlay) {
                if (sidebar.classList.contains('show-mobile')) {
                  overlay.style.display = 'block';
                  setTimeout(() => overlay.style.opacity = '1', 10);
                } else {
                  overlay.style.opacity = '0';
                  setTimeout(() => overlay.style.display = 'none', 300);
                }
              }
            }
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </header>

        <main className="admin-content-area">
          {children}
        </main>
      </div>

      <style jsx>{`
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #f8f9fc;
        }
        .admin-main-wrapper {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .admin-content-area {
          flex: 1;
          overflow-y: auto;
          background: #f8fafc;
        }
        .mobile-header {
          display: none;
          height: 64px;
          background: #0f172a;
          color: white;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.25rem;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .mobile-brand {
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        .mobile-menu-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .mobile-header {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
