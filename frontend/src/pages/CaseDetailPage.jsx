import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCase = async () => {
    try {
      console.log('Fetching case:', id);
      const response = await api.get(`/api/cases/${id}`);
      console.log('Case data:', response.data);
      setCaseData(response.data);
      setNewStatus(response.data.status);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching case:', err);
      setError('Failed to load case: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleDeleteCase = async () => {
    if (!window.confirm('Are you sure you want to delete this case? You can recover it later.')) {
      return;
    }

    try {
      await api.delete(`/api/cases/${id}`);
      alert('Case deleted successfully');
      navigate('/');
    } catch (err) {
      setError('Failed to delete case');
    }
  };

  const handleRecoverCase = async () => {
    if (!window.confirm('Recover this deleted case?')) {
      return;
    }

    try {
      await api.post(`/api/cases/${id}/recover`);
      alert('Case recovered successfully');
      fetchCase();
    } catch (err) {
      setError('Failed to recover case');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/api/cases/${id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchCase();
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/api/cases/${id}`, { status });
      setNewStatus(status);
      fetchCase();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await api.post(`/api/cases/${id}/notes`, { text: newNote });
      setNewNote('');
      fetchCase();
    } catch (err) {
      setError('Failed to add note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading case...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Case not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">PHCS</h1>
          <p className="text-blue-100">Case #{caseData.id} - {caseData.owner_name}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/cases" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Cases
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Case Information</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <select
                    value={newStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="text-lg font-semibold text-gray-900">{caseData.service_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-gray-900">{new Date(caseData.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-gray-900">{new Date(caseData.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {!caseData.is_deleted && (
                  <button
                    onClick={() => navigate(`/cases/${id}/edit`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    ✏️ Edit Case
                  </button>
                )}
                {caseData.is_deleted ? (
                  <button
                    onClick={handleRecoverCase}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    🔄 Recover Case
                  </button>
                ) : (
                  <button
                    onClick={handleDeleteCase}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    🗑️ Delete Case
                  </button>
                )}
              </div>
            </div>

            {/* Owner & Pet Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Owner Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{caseData.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{caseData.owner_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{caseData.owner_email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Pet Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{caseData.pet_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Species</p>
                    <p className="font-semibold">{caseData.pet_species || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Breed</p>
                    <p className="font-semibold">{caseData.breed || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Case Notes</h3>

              <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
                <button
                  type="submit"
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Add Note
                </button>
              </form>

              <div className="space-y-4">
                {caseData.notes && caseData.notes.length > 0 ? (
                  caseData.notes.map(note => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900">Staff Note</p>
                        <span className="text-sm text-gray-500">{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No notes yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Files Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Files</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                {caseData.files && caseData.files.length > 0 ? (
                  caseData.files.map(file => (
                    <a
                      key={file.id}
                      href={`/api/files/${file.id}/download`}
                      className="block p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition text-sm text-blue-600 truncate"
                      title={file.filename}
                    >
                      📎 {file.filename}
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-2">No files</p>
                )}
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Services</h3>
              {caseData.services && caseData.services.length > 0 ? (
                <div className="space-y-2">
                  {caseData.services.map(service => (
                    <div key={service.id} className="p-3 bg-gray-50 border border-gray-200 rounded">
                      <p className="font-semibold text-sm">{service.service_type}</p>
                      <p className="text-xs text-gray-600">
                        Status: <span className="font-medium">{service.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No services assigned</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
