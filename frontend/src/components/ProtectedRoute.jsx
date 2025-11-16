import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireRole = null }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if a specific role is required and user doesn't have it
  if (requireRole && user.role !== requireRole) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-red-600">Required role: {requireRole}</p>
        </div>
      </div>
    );
  }

  return children;
};
