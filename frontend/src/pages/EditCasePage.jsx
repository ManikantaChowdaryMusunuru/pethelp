import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const EditCasePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    pet_name: '',
    pet_species: '',
    breed: '',
    service_type: '',
    status: '',
    outcome: ''
  });

  const fetchCase = async () => {
    try {
      const response = await api.get(`/api/cases/${id}`);
      setCaseData(response.data);
      setFormData({
        owner_name: response.data.owner_name || '',
        owner_phone: response.data.owner_phone || '',
        owner_email: response.data.owner_email || '',
        pet_name: response.data.pet_name || '',
        pet_species: response.data.pet_species || '',
        breed: response.data.breed || '',
        service_type: response.data.service_type || '',
        status: response.data.status || '',
        outcome: response.data.outcome || ''
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load case');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.put(`/api/cases/${id}`, formData);
      alert('Case updated successfully');
      navigate(`/cases/${id}`);
    } catch (err) {
      setError('Failed to update case: ' + err.message);
      setSubmitting(false);
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
          <p className="text-blue-100">Edit Case #{caseData.id}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link to={`/cases/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Case
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Edit Case Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status and Service Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <input
                  type="text"
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  placeholder="e.g., Lost Pet Recovery"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outcome
                </label>
                <select
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select outcome (optional)</option>
                  <option value="Pet kept in home">Pet kept in home</option>
                  <option value="Surrendered">Surrendered</option>
                  <option value="Referred to Vet">Referred to Vet</option>
                  <option value="Rehomed">Rehomed</option>
                  <option value="Lost">Lost</option>
                  <option value="Deceased">Deceased</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Owner Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Owner Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    placeholder="Enter owner name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="owner_phone"
                    value={formData.owner_phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="owner_email"
                    value={formData.owner_email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pet Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Pet Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Name
                  </label>
                  <input
                    type="text"
                    name="pet_name"
                    value={formData.pet_name}
                    onChange={handleChange}
                    placeholder="Enter pet name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Species
                  </label>
                  <select
                    name="pet_species"
                    value={formData.pet_species}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select species</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    placeholder="Enter breed"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {submitting ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/cases/${id}`)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
