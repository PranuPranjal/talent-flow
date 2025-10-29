import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HiBriefcase, HiUsers, HiClipboardList, HiChevronDown, HiLogout } from 'react-icons/hi';
import { useState } from 'react';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                <HiBriefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">TalentFlow</span>
            </Link>
          </div>

          {/* center area: nav / search */}
          <div className="flex-1 flex items-center justify-center">
            <nav className="hidden md:flex items-center space-x-4">
            {(() => {
              const { user } = useAuth();
              if (user?.role === 'admin') {
                return (
                  <>
                    <Link to="/candidates" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/candidates') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
                      <HiUsers className="w-5 h-5" />
                      <span>Candidates</span>
                    </Link>
                    <Link to="/jobs" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/jobs') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
                      <HiBriefcase className="w-5 h-5" />
                      <span>Jobs</span>
                    </Link>
                    <Link to="/assessments" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/assessments') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
                      <HiClipboardList className="w-5 h-5" />
                      <span>Assessments</span>
                    </Link>
                  </>
                );
              }

              return (
                <Link to="/jobs" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/jobs') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
                  <HiBriefcase className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              );
            })()}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="text-sm text-blue-600">Sign in</Link>
      </div>
    );
  }

  const initials = user.name ? user.name.split(' ').map(s => s[0]).slice(0,2).join('') : (user.id || 'U').slice(0,2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-3 p-1 rounded-md hover:bg-gray-100"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">{initials}</div>
        <div className="hidden sm:block text-sm text-gray-700">{user.role === 'admin' ? 'Recruiter' : user.name || user.id}</div>
        <HiChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-100 py-2 z-50">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <HiLogout className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
