import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  LayoutDashboard, Users, ClipboardList, Target, Bell, LogOut,
  Search, Trophy, Building2, ShieldCheck, UserCheck, PlusCircle, Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const navConfig: Record<UserRole, { label: string; to: string; icon: React.ReactNode }[]> = {
  STUDENT: [
    { label: 'Dashboard', to: '/dashboard/student', icon: <LayoutDashboard size={18} /> },
    { label: 'My Profile', to: '/dashboard/student/profile', icon: <UserCheck size={18} /> },
    { label: 'Opportunities', to: '/dashboard/student/opportunities', icon: <Target size={18} /> },
    { label: 'Applications', to: '/dashboard/student/applications', icon: <ClipboardList size={18} /> },
    { label: 'Clubs & KIC', to: '/dashboard/clubs', icon: <Building2 size={18} /> },
    { label: 'Notifications', to: '/dashboard/notifications', icon: <Bell size={18} /> },
  ],
  PE_TEACHER: [
    { label: 'Dashboard', to: '/dashboard/teacher', icon: <LayoutDashboard size={18} /> },
    { label: 'My Students', to: '/dashboard/teacher/students', icon: <Users size={18} /> },
    { label: 'Add Fitness Test', to: '/dashboard/teacher/add-test', icon: <PlusCircle size={18} /> },
    { label: 'Notifications', to: '/dashboard/notifications', icon: <Bell size={18} /> },
  ],
  CLUB: [
    { label: 'Dashboard', to: '/dashboard/club', icon: <LayoutDashboard size={18} /> },
    { label: 'Notifications', to: '/dashboard/notifications', icon: <Bell size={18} /> },
  ],
  SCOUT: [
    { label: 'Dashboard', to: '/dashboard/scout', icon: <LayoutDashboard size={18} /> },
    { label: 'Athlete Discovery', to: '/dashboard/scout/athletes', icon: <Search size={18} /> },
    { label: 'Shortlist', to: '/dashboard/scout/shortlist', icon: <Star size={18} /> },
    { label: 'Notifications', to: '/dashboard/notifications', icon: <Bell size={18} /> },
  ],
  GOVERNMENT_ORGANIZATION: [
    { label: 'Dashboard', to: '/dashboard/gov', icon: <LayoutDashboard size={18} /> },
    { label: 'Create Opportunity', to: '/dashboard/gov/create', icon: <PlusCircle size={18} /> },
    { label: 'Notifications', to: '/dashboard/notifications', icon: <Bell size={18} /> },
  ],
  ADMIN: [
    { label: 'Dashboard', to: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Users', to: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Verifications', to: '/dashboard/admin/verifications', icon: <ShieldCheck size={18} /> },
    { label: 'Notifications', to: '/dashboard/notifications', icon: <Bell size={18} /> },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const refresh = () => api.get('/notifications').then(r => setUnread(r.data.unreadCount || 0)).catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => window.clearInterval(timer);
  }, [location.pathname]);

  const links = user ? navConfig[user.role] || [] : [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Talent Bridge</p>
              <p className="text-xs text-gray-500">Talent infrastructure</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              {link.icon}
              <span>{link.label}</span>
              {link.label === 'Notifications' && unread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/'); }} className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-semibold text-gray-900 lg:hidden">Talent Bridge</span>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
