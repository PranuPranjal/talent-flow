import { Link, useLocation } from 'react-router-dom';

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
              to="/assessments"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/assessments')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Assessments
            </Link>
          </nav>

          {/* user menu placeholder */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">HR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
