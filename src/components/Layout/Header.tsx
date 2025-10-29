import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HiBriefcase, HiUsers, HiClipboardList, HiChevronDown, HiLogout } from 'react-icons/hi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { JSX } from 'react/jsx-runtime';

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group transition-transform hover:scale-[1.02]"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <HiBriefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              TalentFlow
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-4">
            {user?.role === 'admin' ? (
              <>
                <NavLink
                  to="/jobs"
                  icon={<HiBriefcase className="w-5 h-5" />}
                  label="Jobs"
                  active={isActive('/jobs')}
                />
                <NavLink
                  to="/candidates"
                  icon={<HiUsers className="w-5 h-5" />}
                  label="Candidates"
                  active={isActive('/candidates')}
                />
                <NavLink
                  to="/assessments"
                  icon={<HiClipboardList className="w-5 h-5" />}
                  label="Assessments"
                  active={isActive('/assessments')}
                />
              </>
            ) : (
              <NavLink
                to="/jobs"
                icon={<HiBriefcase className="w-5 h-5" />}
                label="Profile"
                active={isActive('/jobs')}
              />
            )}
          </nav>

          {/* Right-side menu */}
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

interface NavLinkProps {
  to: string;
  icon: JSX.Element;
  label: string;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-blue-100 text-blue-700 shadow-sm'
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
    : (user.id || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-3 p-1 rounded-md hover:bg-gray-100 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium"
        >
          {initials}
        </motion.div>
        <div className="hidden sm:block text-sm text-gray-700 font-medium">
          {user.role === 'admin' ? 'Recruiter' : user.name || user.id}
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <HiChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-100 py-2 z-50 origin-top-right"
          >
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <HiLogout className="w-4 h-4 text-gray-600" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;