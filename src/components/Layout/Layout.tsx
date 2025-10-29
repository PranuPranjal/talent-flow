import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="app-card p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
