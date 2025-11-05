import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';

// Placeholder components - to be implemented
const LoginPage = () => <div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl font-bold">Login Page</h1></div>;
const DashboardPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1></div>;

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
