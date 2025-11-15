import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const DeletedCasesPage = () => {
  const [deletedCases, setDeletedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchDeletedCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cases/deleted/list');
      setDeletedCases(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to fetch deleted cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedCases();
  }, []);

  const handleRecover = async (caseId) => {
    if (!window.confirm('Recover this case?')) {
      return;
    }

    try {
      await api.post(`/api/cases/${caseId}/recover`);
      alert('Case recovered successfully');
      fetchDeletedCases();
    } catch (err) {
      alert('Failed to recover case: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading deleted cases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">PHCS</h1>
            <p className="text-blue-100">Pet Help Center Case Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-blue-100">Welcome, {user?.name}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Active Cases
          </Link>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">Deleted Cases</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {deletedCases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 text-lg">No deleted cases</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Owner</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pet</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deleted</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedCases.map((caseItem) => (
                  <tr key={caseItem.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{caseItem.owner_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{caseItem.owner_phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{caseItem.pet_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{caseItem.service_type}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(caseItem.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleRecover(caseItem.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
                      >
                        🔄 Recover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
