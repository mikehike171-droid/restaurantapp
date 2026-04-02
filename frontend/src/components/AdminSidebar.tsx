'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { 
  Menu, 
  ChevronLeft, 
  LayoutDashboard, 
  Folder, 
  Utensils, 
  Table, 
  MapPin, 
  QrCode, 
  Users, 
  ShieldCheck,
  LogOut,
  Navigation,
  Image as ImageIcon,
  Percent
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    const normalizedUserRole = user.role.toLowerCase().replace(/[^a-z]/g, '');
    const normalizedRoles = roles.map(r => r.toLowerCase().replace(/[^a-z]/g, ''));
    return normalizedRoles.includes(normalizedUserRole);
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Categories', href: '/admin/categories', roles: ['superadmin', 'admin', 'manager'], icon: Folder },
    { label: 'Promos & Offers', href: '/admin/offers', roles: ['superadmin', 'admin', 'manager'], icon: Percent },
    { label: 'Menu Manager', href: '/admin/menu', roles: ['superadmin', 'admin', 'manager', 'staff'], icon: Utensils },
    { label: 'Table Master', href: '/admin/tables', roles: ['superadmin', 'admin', 'manager'], icon: Table },
    { label: 'Locations', href: '/admin/locations', roles: ['superadmin', 'admin'], icon: MapPin },
    { label: 'Home Sliders', href: '/admin/home-sliders', roles: ['superadmin', 'admin'], icon: ImageIcon },
    { label: 'QR Codes', href: '/admin/qr-codes', roles: ['superadmin', 'admin'], icon: QrCode },
    { label: 'Pincodes', href: '/admin/pincodes', roles: ['superadmin', 'admin'], icon: Navigation },
    { label: 'Roles', href: '/admin/roles', roles: ['superadmin', 'admin'], icon: ShieldCheck },
    { label: 'Users', href: '/admin/users', roles: ['superadmin', 'admin'], icon: Users },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || hasRole(item.roles)
  );

  const sidebarWidth = isCollapsed ? '80px' : '260px';

  return (
    <div className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Mobile Backdrop */}
      <div 
        className={`mobile-overlay ${isMobileOpen ? 'visible' : ''}`} 
        onClick={() => setIsMobileOpen(false)} 
      />
      
      <aside 
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'show-mobile' : ''}`}
      >
        <div className="sidebar-header">
          <div className="brand-container">
            <span className="brand-logo">🍽️</span>
            <div className="brand-info">
              <div className="brand-name">RestaurantOS</div>
              <div className="brand-sub">Admin Panel</div>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
            className={`toggle-btn ${isCollapsed ? 'collapsed-btn' : ''}`}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav custom-scrollbar">
          {mounted && filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              title={isCollapsed ? item.label : ""}
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="nav-link-content">
                <span className="nav-icon">
                  <item.icon size={22} strokeWidth={2.5} />
                </span>
                <span className="nav-text">{item.label}</span>
                {isCollapsed && (
                  <div className="nav-tooltip">{item.label}</div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{mounted ? (user?.name?.charAt(0) || 'U') : ''}</div>
            <div className="user-details">
              <div className="user-name">{mounted ? user?.name : ''}</div>
              <div className="user-role">{mounted ? user?.role : ''}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="logout-button"
            title={isCollapsed ? "Logout" : ""}
          >
            <div className="logout-content">
              <LogOut size={20} />
              <span className="logout-text">Logout</span>
              {isCollapsed && (
                <div className="nav-tooltip">Logout</div>
              )}
            </div>
          </button>
        </div>
      </aside>

      <style jsx>{`
        .sidebar-container {
          z-index: 1000;
        }
        
        .sidebar {
          width: ${sidebarWidth};
          background: #0f172a;
          color: white;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1001;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.1);
          overflow: visible; /* Allow tooltips to go outside */
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .mobile-overlay.visible {
          display: block;
          opacity: 1;
        }

        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            left: -260px !important;
            width: 260px !important;
            height: 100vh;
            overflow: hidden;
          }
          .sidebar.show-mobile {
            left: 0 !important;
          }
          .toggle-btn {
            display: none;
          }
          .nav-text {
            opacity: 1 !important;
          }
          .brand-container {
            opacity: 1 !important;
            transform: none !important;
            display: flex !important;
            width: auto !important;
            min-width: 180px !important;
          }
          .nav-tooltip {
            display: none !important;
          }
        }

        .sidebar-header {
          padding: 1.5rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
          position: relative;
        }

        .brand-container {
          display: ${isCollapsed ? 'none' : 'flex'};
          align-items: center;
          gap: 1rem;
          min-width: 180px;
          opacity: ${isCollapsed ? 0 : 1};
          transform: translateX(${isCollapsed ? '-20px' : '0'});
          transition: all 0.3s;
        }

        .brand-logo { font-size: 1.75rem; }
        .brand-name { font-weight: 800; font-size: 1.1rem; color: #f8fafc; letter-spacing: -0.025em; }
        .brand-sub { font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

        .toggle-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 0.5rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        .collapsed-btn {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .toggle-btn:hover { background: #6366f1; color: white; border-color: #6366f1; }

        .sidebar-nav {
          flex: 1;
          padding: 1.25rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
          overflow-x: visible; 
        }

        /* Custom Scrollbar for Sidebar Nav */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .nav-item {
          text-decoration: none;
          color: #94a3b8;
          border-radius: 1rem;
          transition: all 0.2s;
          position: relative;
        }

        .nav-link-content {
          display: flex;
          align-items: center;
          padding: 0.85rem;
          gap: 1.15rem;
          position: relative;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          flex-shrink: 0;
          transition: all 0.3s;
        }

        .nav-text {
          font-size: 0.95rem;
          font-weight: 600;
          white-space: nowrap;
          opacity: ${isCollapsed ? 0 : 1};
          transition: opacity 0.2s;
          pointer-events: ${isCollapsed ? 'none' : 'auto'};
        }

        .nav-item:hover {
          background: rgba(99, 102, 241, 0.1);
          color: #f1f5f9;
        }

        .nav-item:hover .nav-icon {
          color: #6366f1;
        }

        .nav-item.active {
          background: #6366f1;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .nav-item.active .nav-icon { color: white; }

        .nav-tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(10px);
          margin-left: 0.5rem;
          background: #1e293b;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          z-index: 2000;
        }

        .nav-item:hover .nav-tooltip,
        .logout-button:hover .nav-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(20px);
        }

        .sidebar-footer {
          padding: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
          position: relative;
          overflow: visible;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          transition: all 0.3s;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
        }

        .user-details {
          display: ${isCollapsed ? 'none' : 'block'};
          opacity: ${isCollapsed ? 0 : 1};
          transition: opacity 0.2s;
          min-width: 0;
        }

        .user-name { font-weight: 700; font-size: 0.9rem; color: #f8fafc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-role { font-size: 0.65rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

        .logout-button {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
          position: relative;
        }

        .logout-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
        }

        .logout-button:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
        }

        .logout-text {
          display: ${isCollapsed ? 'none' : 'block'};
          opacity: ${isCollapsed ? 0 : 1};
          transition: opacity 0.2s;
        }
      `}</style>
    </div>
  );
}
