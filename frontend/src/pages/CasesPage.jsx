import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const CasesPage = () => {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchCases = async () => {
    try {
      setLoading(true);
      const url = filter === 'All' 
        ? '/api/cases' 
        : `/api/cases?status=${encodeURIComponent(filter)}`;
      const response = await api.get(url);
      setCases(response.data);
    } catch (err) {
      setError('Failed to fetch cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [filter]);

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Active Cases</h2>
          <div className="flex gap-3">
            <Link
              to="/search"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              🔍 Search Cases
            </Link>
            <Link
              to="/cases/new"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              + New Case
            </Link>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['All', 'New', 'In Progress', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No cases found</p>
            <Link
              to="/cases/new"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create the first case
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pet</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{caseItem.owner_name}</div>
                      <div className="text-sm text-gray-500">{caseItem.owner_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{caseItem.pet_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-900">{caseItem.service_type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${
                        caseItem.status === 'New' ? 'bg-yellow-500' :
                        caseItem.status === 'In Progress' ? 'bg-blue-500' :
                        caseItem.status === 'On Hold' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(caseItem.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/cases/${caseItem.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        View
                      </Link>
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
