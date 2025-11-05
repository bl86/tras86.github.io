import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';
import { Button } from '../ui/Button';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Companies', path: '/companies', icon: '🏢' },
    { name: 'Chart of Accounts', path: '/accounts', icon: '📚' },
    { name: 'Journal Entries', path: '/journal-entries', icon: '📝' },
    { name: 'Partners', path: '/partners', icon: '👥' },
    { name: 'Employees', path: '/employees', icon: '👤' },
    { name: 'Payroll', path: '/payroll', icon: '💰' },
    { name: 'Cost Centers', path: '/cost-centers', icon: '🏷️' },
    { name: 'Reports', path: '/reports', icon: '📈' },
    { name: '🧪 Run Tests', path: '/test', icon: '🧪' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ☰
              </button>
              <h1 className="text-xl font-bold text-gray-900">Accounting System BiH</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button size="sm" variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-white shadow-sm fixed left-0 top-16 bottom-0 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium
                      ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
          {children}
        </main>
      </div>
    </div>
  );
};
