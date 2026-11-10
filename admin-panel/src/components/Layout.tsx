import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  FaUser,
  FaUsers,
  FaFileAlt,
  FaExclamationTriangle,
  FaChartBar,
  FaCheckCircle,
  FaSignOutAlt,
  FaBars,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const menuItems = [
          { key: '/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
    { key: '/profile', icon: <FaUser />, label: 'Court Locator' },
    { key: '/owner-approvals', icon: <FaCheckCircle />, label: 'Owner Approvals' },
    { key: '/user-management', icon: <FaUsers />, label: 'User Management' },
    { key: '/complaints', icon: <FaExclamationTriangle />, label: 'Complaints' },
    { key: '/monitor-bookings', icon: <FaChartBar />, label: 'Monitor Bookings' },
    { key: '/reports', icon: <FaFileAlt />, label: 'Reports' },

  ];

  const onMenuClick = (key: string) => {
    navigate(key);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <>
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f6f7fb;
          overflow: visible;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .sidebar {
          width: 254px;
          background: linear-gradient(180deg, #0f172a 0%, #1a1f4d 100%);
          color: white;
          transition: all 0.3s ease;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }

        .sidebar.collapsed {
          width: 66px;
        }

        .sidebar-header {
          padding: 20px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 17px;
          white-space: nowrap;
          overflow: hidden;
          font-weight: 700;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-logo {
          width: 34px; height: 34px;
          flex-shrink: 0;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
        }

        .sidebar-toggle {
          background: rgba(255,255,255,0.08);
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-size: 13px;
          padding: 6px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .sidebar-toggle:hover {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-nav ul {
          list-style: none;
          padding: 12px 10px;
          margin: 0;
        }

        .sidebar-nav li {
          padding: 11px 14px;
          margin-bottom: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          border-radius: 10px;
          color: rgba(255,255,255,0.65);
          font-size: 14px;
          font-weight: 500;
        }

        .sidebar-nav li:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .sidebar-nav li.active {
          background: linear-gradient(135deg, rgba(79,70,229,0.9), rgba(124,58,237,0.8));
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
        }

        .menu-icon {
          font-size: 17px;
          margin-right: 14px;
          min-width: 20px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-label {
          white-space: nowrap;
          overflow: hidden;
        }

        .sidebar.collapsed .menu-label {
          display: none;
        }

        .sidebar.collapsed .menu-icon {
          margin-right: 0;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding-top: 64px; /* height of the fixed header */
          margin-left: 254px;
          box-sizing: border-box;
        }

        .admin-layout.sidebar-collapsed .main-content {
          margin-left: 66px;
        }

        .admin-header {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          padding: 0 24px;
          height: 64px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(15,23,42,0.06);
          position: fixed;
          top: 0;
          left: 254px;
          right: 0;
          z-index: 1001;
        }

        .admin-header.collapsed {
          left: 66px;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .mobile-sidebar-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          margin-right: 15px;
        }

        .admin-header h1 {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          color: #0f172a;
        }

        .header-date {
          font-size: 12px;
          color: #94a3b8;
          margin-left: 12px;
          font-weight: 400;
        }

        .user-menu {
          position: relative;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 17px;
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3);
          transition: transform 0.2s;
        }

        .user-avatar:hover {
          transform: scale(1.06);
        }

        .user-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
          min-width: 160px;
          z-index: 1000;
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }

        .dropdown-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 14px;
          color: #334155;
        }

        .dropdown-item:hover {
          background-color: #f8fafc;
          color: #4f46e5;
        }

        .dropdown-icon {
          margin-right: 10px;
        }

        .content-area {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 992px) {
          .sidebar {
            position: fixed;
            left: 0;
            height: 100%;
            transform: translateX(-100%);
            z-index: 1000;
          }

          .sidebar.collapsed {
            transform: translateX(0);
            width: 250px;
          }

          .mobile-sidebar-toggle {
            display: block;
          }

          .sidebar-toggle {
            display: none;
          }

          .admin-header {
            padding: 0 15px;
            left: 0;
          }

          .content-area {
            padding: 15px;
          }
        }

        @media (max-width: 576px) {
          .sidebar.collapsed {
            width: 100%;
          }

          .admin-header h1 {
            font-size: 18px;
          }

          .content-area {
            padding: 10px;
          }
        }
      `}</style>

      <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h2><span className="sidebar-logo"><FaCheckCircle /></span>{!sidebarCollapsed && 'PlaySpot Admin'}</h2>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarCollapsed ? <FaArrowRight /> : <FaArrowLeft />}
            </button>
          </div>
          <nav className="sidebar-nav">
            <ul>
              {menuItems.map(item => (
                <li 
                  key={item.key} 
                  className={location.pathname === item.key ? 'active' : ''}
                  onClick={() => onMenuClick(item.key)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="menu-label">{item.label}</span>}
                </li>
              ))}
            </ul>
          </nav>
          <div className="sidebar-footer">{!sidebarCollapsed && '© Indoor Sports Hub'}</div>
        </div>
        
        <div className="main-content">
          <header className={`admin-header ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="header-left">
              <button className="mobile-sidebar-toggle" onClick={toggleSidebar}>
                <FaBars />
              </button>
              <h1>Dashboard<span className="header-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></h1>
            </div>
            
            <div className="user-menu">
              <div className="user-avatar" onClick={toggleUserDropdown}>
                <FaUser />
                {userDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-item" onClick={() => logout()}>
                      <span className="dropdown-icon"><FaSignOutAlt /></span>
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          <div className="content-area">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
