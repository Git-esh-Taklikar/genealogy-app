import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import { cn } from '../utils/helpers';
import {
  Menu,
  X,
  TreePine,
  Search,
  Calendar,
  Upload,
  User,
  LogOut,
  Tv,
  ChevronDown,
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: TreePine },
  { to: '/pathfinder', label: 'Pathfinder', icon: Search },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/upload', label: 'Upload', icon: Upload },
];

export default function Navbar() {
  const { user, personNode, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.photoURL;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-warm-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Title */}
          <Link to="/dashboard" className="flex items-center gap-2 min-w-touch min-h-touch">
            <Logo size="sm" />
            <span className="font-display text-xl font-bold text-accent-950 hidden sm:block">
              Genealogy
            </span>
          </Link>

          {/* Center: Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-touch',
                    isActive
                      ? 'bg-brand-100 text-brand-800'
                      : 'text-gray-600 hover:bg-warm-100 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Profile dropdown */}
          <div className="flex items-center gap-2">
            {/* Kiosk toggle */}
            {personNode && (
              <Link
                to={`/tree/${personNode.id}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-accent-700 hover:bg-accent-50 rounded-lg transition-colors min-h-touch"
                title="View my tree"
              >
                <TreePine size={18} />
                <span className="hidden lg:inline">My Tree</span>
              </Link>
            )}

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-warm-100 transition-colors min-h-touch min-w-touch"
                aria-label="User menu"
                aria-expanded={profileDropdownOpen}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown size={14} className="hidden sm:block text-gray-500" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-warm-200 py-2 z-20 animate-fade-up">
                    <div className="px-4 py-2 border-b border-warm-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-warm-50 min-h-touch"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left min-h-touch"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-warm-100 min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-touch',
                    isActive
                      ? 'bg-brand-100 text-brand-800'
                      : 'text-gray-600 hover:bg-warm-100'
                  )}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
            {personNode && (
              <Link
                to={`/tree/${personNode.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-accent-700 hover:bg-accent-50 min-h-touch"
              >
                <TreePine size={20} />
                My Tree
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

