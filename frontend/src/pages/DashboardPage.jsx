import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">📊 Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Cases */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Cases</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          {/* Active Cases */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Cases</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCases}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{stats.thisMonthCases}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          {/* Growth */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">95%</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cases by Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cases by Status</h2>
            <div className="space-y-4">
              {stats.casesByStatus && stats.casesByStatus.length > 0 ? (
                stats.casesByStatus.map((item, idx) => {
                  const colors = ['bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-red-600'];
                  const percentage = stats.totalCases > 0 ? (item.count / stats.totalCases * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="flex items-center">
                      <div className="w-32">
                        <p className="text-sm font-medium text-gray-700 capitalize">{item.status}</p>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${colors[idx % colors.length]} h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <p className="text-sm font-bold text-gray-900">{item.count} ({percentage}%)</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No status data available</p>
              )}
            </div>
          </div>

          {/* Top Service Types */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Service Types</h2>
            <div className="space-y-4">
              {stats.topServices && stats.topServices.length > 0 ? (
                stats.topServices.map((item, idx) => {
                  const colors = ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-orange-500 to-orange-600', 'from-pink-500 to-pink-600'];
                  return (
                    <div key={idx} className="flex items-center">
                      <div className="w-32">
                        <p className="text-sm font-medium text-gray-700 truncate">{item.service || 'Unknown'}</p>
                      </div>
                      <div className="flex-1">
                        <div className={`bg-gradient-to-r ${colors[idx % colors.length]} h-8 rounded flex items-center justify-center text-white font-bold text-sm`}>
                          {item.count}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No service data available</p>
              )}
            </div>
          </div>

          {/* Top Species */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Species</h2>
            <div className="space-y-4">
              {stats.topSpecies && stats.topSpecies.length > 0 ? (
                stats.topSpecies.map((item, idx) => {
                  const icons = ['🐕', '🐈', '🐦', '🐰', '🦎'];
                  const colors = ['bg-yellow-100 text-yellow-800', 'bg-pink-100 text-pink-800', 'bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 'bg-green-100 text-green-800'];
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{icons[idx % icons.length]}</span>
                        <span className="font-medium text-gray-900">{item.species || 'Unknown'}</span>
                      </div>
                      <span className={`${colors[idx % colors.length]} px-3 py-1 rounded-full text-sm font-bold`}>
                        {item.count}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No species data available</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/cases/new')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition text-left"
              >
                ➕ Create New Case
              </button>
              <button
                onClick={() => navigate('/import')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition text-left"
              >
                📥 Import Data
              </button>
              <button
                onClick={() => navigate('/cases')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition text-left"
              >
                📋 View All Cases
              </button>
              <button
                onClick={() => navigate('/search')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-semibold transition text-left"
              >
                🔍 Search Cases
              </button>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="w-full block text-center bg-red-700 hover:bg-red-800 text-white px-4 py-3 rounded-lg font-semibold transition"
                >
                  👨‍💼 Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
