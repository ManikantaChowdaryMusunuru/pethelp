import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const DataImportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['csv', 'json'].includes(ext);
    });

    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were skipped - only CSV and JSON formats are supported');
    }

    setFiles(validFiles);
    setError('');
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    const validFiles = droppedFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['csv', 'json'].includes(ext);
    });

    if (validFiles.length !== droppedFiles.length) {
      setError('Some files were skipped - only CSV and JSON formats are supported');
    }

    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await api.post('/api/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setPreviewData(response.data);
      setFiles([]);
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;

    const allRecords = previewData.previewData
      .flatMap(f => f.records || [])
      .filter(r => !r._errors || r._errors.length === 0)
      .map(r => {
        const { _index, _errors, ...cleaned } = r;
        return cleaned;
      });
    
    if (allRecords.length === 0) {
      setError('No valid records to import. Please fix errors in preview.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/import/confirm', { importData: allRecords });
      alert(`✅ Successfully imported ${response.data.importedCount} cases!`);
      
      if (response.data.errors && response.data.errors.length > 0) {
        alert(`⚠️ Some records had errors:\n${response.data.errors.slice(0, 5).map(e => `${e.index}: ${e.error}`).join('\n')}`);
      }
      
      setPreviewData(null);
      navigate('/cases');
    } catch (err) {
      setError('Import confirmation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">PHCS</h1>
            <p className="text-blue-100">Import Cases from CSV/JSON</p>
          </div>
          <Link to="/" className="text-blue-100 hover:text-white">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!previewData ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Upload Data Files</h2>
            <p className="text-gray-600 mb-6">
              Upload CSV or JSON files to bulk import cases. You'll be able to preview and edit the data before confirming the import.
            </p>

            {/* File Upload Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition"
            >
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">Drag and drop CSV or JSON files here</p>
              <p className="text-gray-500 text-sm mb-4">or click to select files</p>
              <input
                type="file"
                multiple
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer transition"
              >
                Select Files
              </label>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Selected Files ({files.length})</h3>
                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span className="text-gray-700">{file.name}</span>
                      <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>

                {/* Upload Progress */}
                {loading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Uploading...</span>
                      <span className="text-sm font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  {loading ? 'Uploading...' : '📤 Upload & Preview'}
                </button>
              </div>
            )}

            {/* File Format Help */}
            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Supported Formats</h3>
              <p className="text-sm text-blue-800 mb-3">
                <strong>CSV:</strong> Must include columns: owner_name, owner_phone, pet_name, service_type
              </p>
              <p className="text-sm text-blue-800">
                <strong>JSON:</strong> Array of objects with the same columns
              </p>
              <p className="text-sm text-blue-800 mt-3">
                <strong>Optional columns:</strong> owner_email, pet_species, breed, status, notes
              </p>
            </div>
          </div>
        ) : (
          <DataPreview
            previewData={previewData}
            onConfirm={handleConfirmImport}
            onCancel={() => setPreviewData(null)}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
};

const DataPreview = ({ previewData, onConfirm, onCancel, loading }) => {
  const [editingRecords, setEditingRecords] = useState({});

  const totalRecords = previewData.previewData.reduce((sum, f) => sum + (f.records?.length || 0), 0);
  const recordsWithErrors = previewData.previewData.flatMap(f =>
    (f.records || []).filter(r => r._errors && r._errors.length > 0)
  );

  const handleEditField = (fileIdx, recordIdx, field, value) => {
    const key = `${fileIdx}-${recordIdx}`;
    setEditingRecords(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value }
    }));
  };

  const getDisplayValue = (fileIdx, recordIdx, field, originalValue) => {
    const key = `${fileIdx}-${recordIdx}`;
    return editingRecords[key]?.[field] ?? originalValue;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Preview & Edit Data</h2>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-2xl font-bold text-blue-600">{totalRecords}</p>
        </div>
        <div className={`p-4 rounded ${recordsWithErrors.length > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <p className="text-sm text-gray-600">Records with Issues</p>
          <p className={`text-2xl font-bold ${recordsWithErrors.length > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            {recordsWithErrors.length}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600">Files</p>
          <p className="text-2xl font-bold text-gray-600">{previewData.previewData.length}</p>
        </div>
      </div>

      {/* File Previews */}
      <div className="space-y-6">
        {previewData.previewData.map((fileData, fileIdx) => (
          <div key={fileIdx} className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">{fileData.fileName}</h3>
            {fileData.status === 'error' ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                Error: {fileData.error}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {fileData.recordCount} records {fileData.status === 'warning' ? '⚠️ (with issues)' : '✅ (valid)'}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Owner</th>
                        <th className="px-4 py-2 text-left">Phone</th>
                        <th className="px-4 py-2 text-left">Pet</th>
                        <th className="px-4 py-2 text-left">Service</th>
                        <th className="px-4 py-2 text-left">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(fileData.records || []).slice(0, 5).map((record, recordIdx) => (
                        <tr key={recordIdx} className={record._errors?.length > 0 ? 'bg-yellow-50' : ''}>
                          <td className="px-4 py-2">{record.owner_name}</td>
                          <td className="px-4 py-2">{record.owner_phone}</td>
                          <td className="px-4 py-2">{record.pet_name}</td>
                          <td className="px-4 py-2">{record.service_type}</td>
                          <td className="px-4 py-2">
                            {record._errors?.length > 0 ? (
                              <span className="text-xs text-yellow-700">{record._errors.length} error(s)</span>
                            ) : (
                              <span className="text-xs text-green-700">✓</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(fileData.records?.length || 0) > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ... and {fileData.records.length - 5} more records
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          ← Back to Upload
        </button>
        <button
          onClick={onConfirm}
          disabled={loading || recordsWithErrors.length === totalRecords}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {loading ? 'Importing...' : '✅ Confirm Import'}
        </button>
      </div>
    </div>
  );
};
