import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield, FileText, Settings, Menu, X } from 'lucide-react';

export default function Layout() {
  const { session, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  // Redirect based on role if needed, or handle in App.tsx
  // Ideally, different roles have different navigation items

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        navigate(to);
        setIsMobileMenuOpen(false);
      }}
      className="flex items-center space-x-3 w-full px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex-shrink-0 flex items-center ml-2 md:ml-0">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Sigorta</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span>{profile?.full_name}</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium uppercase">
                  {profile?.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              <div className="px-4 py-2 mb-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
              {profile?.role === 'tali' && (
                <>
                  <NavItem to="/dashboard/tali" icon={FileText} label="Tekliflerim" />
                  <NavItem to="/quotes/create" icon={FileText} label="Yeni Teklif" />
                </>
              )}
              {profile?.role === 'calisan' && (
                <>
                  <NavItem to="/dashboard/calisan" icon={FileText} label="Teklif Havuzu" />
                  <NavItem to="/policies" icon={Shield} label="Poliçeler" />
                </>
              )}
              {profile?.role === 'admin' && (
                <>
                  <NavItem to="/dashboard/admin" icon={Shield} label="Yönetim Paneli" />
                  <NavItem to="/settings" icon={Settings} label="Ayarlar" />
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
