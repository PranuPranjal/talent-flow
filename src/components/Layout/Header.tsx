import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TalentFlow</span>
            </Link>
          </div>

          {/* Navbar */}
          <nav className="flex space-x-8">
            
            {(() => {
              const { user } = useAuth();
              // only show Candidates & Assessments nav to admin users
              if (user?.role === 'admin') {
                return (
                  <>
                    <Link
                      to="/candidates"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/candidates')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Candidates
                    </Link>
                    <Link
                      to="/jobs"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/jobs')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Jobs
                    </Link>
                    <Link
                      to="/assessments"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/assessments')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Assessments
                    </Link>
                  </>
                );
              } else {
                  return (
                    <Link
                      to="/jobs"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/jobs')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Profile
                    </Link>
                  );
              }
            })()}
          </nav>

          {/* user menu */}
          <div className="flex items-center space-x-4">
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

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="text-sm text-blue-600">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-700">{user.role === 'admin' ? 'Recruiter' : user.name || user.id}</div>
      <button
        className="text-sm text-gray-500 hover:text-gray-700"
        onClick={() => {
          logout();
          navigate('/');
        }}
      >
        Sign out
      </button>
    </div>
  );
};

export default Header;
