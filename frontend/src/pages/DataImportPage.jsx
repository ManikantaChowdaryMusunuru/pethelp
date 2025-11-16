import React, { useState } from 'react';
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

  const handleConfirmImport = async (recordsToImport) => {
    if (!recordsToImport || recordsToImport.length === 0) {
      setError('No valid records to import');
      return;
    }

    const allRecords = recordsToImport
      .filter(r => !r._hasErrors)
      .map(r => {
        const { _index, _errors, _originalErrors, _edited, _newErrors, _hasErrors, ...cleaned } = r;
        return cleaned;
      });
    
    if (allRecords.length === 0) {
      setError('No valid records to import. Please fix errors or select different records.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/import/confirm', { importData: allRecords });
      alert(`✅ Successfully imported ${response.data.importedCount} cases!`);
      
      if (response.data.errors && response.data.errors.length > 0) {
        alert(`⚠️ Some records had errors:\n${response.data.errors.slice(0, 5).join('\n')}`);
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
  const [expandedRows, setExpandedRows] = useState({});
  const [filterErrors, setFilterErrors] = useState(false);

  const totalRecords = previewData.previewData.reduce((sum, f) => sum + (f.records?.length || 0), 0);
  const recordsWithErrors = previewData.previewData.flatMap(f =>
    (f.records || []).filter(r => r._errors && r._errors.length > 0)
  );
  const validRecords = totalRecords - recordsWithErrors.length;

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

  const toggleRowExpand = (key) => {
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const hasChanges = Object.keys(editingRecords).length > 0;

  // Validate individual field values
  const validateEditedField = (fieldName, value) => {
    if (!value || !String(value).trim()) {
      if (['owner_name', 'owner_phone', 'pet_name', 'service_type'].includes(fieldName)) {
        return `${fieldName} is required`;
      }
    }
    
    if (fieldName === 'owner_phone' && value) {
      const phoneDigits = String(value).replace(/\D/g, '');
      if (phoneDigits.length < 7) {
        return `Phone must have at least 7 digits`;
      }
    }

    if (fieldName === 'owner_email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return `Invalid email format`;
      }
    }

    return null;
  };

  // Re-validate record after edits
  const validateRecord = (record) => {
    const errors = [];
    const requiredFields = ['owner_name', 'owner_phone', 'pet_name', 'service_type'];
    
    requiredFields.forEach(field => {
      const fieldError = validateEditedField(field, record[field]);
      if (fieldError) {
        errors.push(fieldError);
      }
    });

    // Validate optional fields if they have values
    const optionalValidations = {
      owner_email: validateEditedField('owner_email', record.owner_email)
    };

    Object.values(optionalValidations).forEach(error => {
      if (error) errors.push(error);
    });

    return errors;
  };

  const getRecordsToImport = () => {
    const allRecords = previewData.previewData.flatMap((fileData, fileIdx) =>
      (fileData.records || []).map((record, recordIdx) => ({
        record,
        fileIdx,
        recordIdx,
        key: `${fileIdx}-${recordIdx}`
      }))
    );

    return allRecords
      .filter(({ record }) => !filterErrors || (record._errors && record._errors.length > 0))
      .map(({ record, key }) => {
        const edited = editingRecords[key] || {};
        const mergedRecord = {
          ...record,
          ...edited
        };
        
        // Re-validate the merged record
        const newErrors = validateRecord(mergedRecord);
        
        return {
          ...mergedRecord,
          _originalErrors: record._errors,
          _newErrors: newErrors,
          _hasErrors: newErrors.length > 0,
          _edited: Object.keys(edited).length > 0
        };
      });
  };

  const canImport = getRecordsToImport().some(r => !r._hasErrors);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2">Review & Edit Imported Data</h2>
      <p className="text-gray-600 mb-6">Edit any fields before committing. Invalid records will be skipped during import.</p>

      {/* Source System Info */}
      {previewData.previewData.some(f => f.sourceSystem && f.sourceSystem !== 'manual') && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">🔄 Source Systems Detected</h3>
          {previewData.previewData.map((file, idx) => file.sourceSystem && (
            <div key={idx} className="text-sm text-blue-800 mb-1">
              <strong>{file.fileName}:</strong> {file.sourceSystem === 'voicemail' ? '📞 Voicemail System' : file.sourceSystem === 'waitwhile' ? '🚶 WaitWhile Check-in' : '📝 Manual Entry'}
            </div>
          ))}
          <p className="text-xs text-blue-700 mt-2">Column names have been automatically mapped to unified case fields.</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-2xl font-bold text-blue-600">{totalRecords}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Valid Records</p>
          <p className="text-2xl font-bold text-green-600">{validRecords}</p>
        </div>
        <div className={`p-4 rounded ${recordsWithErrors.length > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p className="text-sm text-gray-600">Records with Issues</p>
          <p className={`text-2xl font-bold ${recordsWithErrors.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {recordsWithErrors.length}
          </p>
        </div>
        <div className={`p-4 rounded ${hasChanges ? 'bg-yellow-50' : 'bg-gray-50'}`}>
          <p className="text-sm text-gray-600">Edits Made</p>
          <p className={`text-2xl font-bold ${hasChanges ? 'text-yellow-600' : 'text-gray-600'}`}>
            {Object.keys(editingRecords).length}
          </p>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="filterErrors"
          checked={filterErrors}
          onChange={(e) => setFilterErrors(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="filterErrors" className="text-sm text-gray-700 cursor-pointer">
          Show only records with issues
        </label>
      </div>

      {/* Records List */}
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
        {getRecordsToImport().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No records to display
          </div>
        ) : (
          getRecordsToImport().map((record, idx) => {
            const rowKey = `${idx}`;
            const isExpanded = expandedRows[rowKey];
            const hasErrors = record._hasErrors;
            const isEdited = record._edited;
            const allErrors = record._newErrors || [];

            return (
              <div key={idx} className={`border rounded p-3 ${hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
                {/* Collapsed View */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleRowExpand(rowKey)}
                    className="flex items-center gap-2 flex-1 text-left hover:bg-gray-100 p-2 rounded transition"
                  >
                    <span className="text-gray-600">{isExpanded ? '▼' : '▶'}</span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {record.owner_name || <span className="text-red-600">MISSING</span>}
                        {isEdited && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Edited</span>}
                      </p>
                      <p className="text-sm text-gray-600">
                        Pet: {record.pet_name || <span className="text-red-600">MISSING</span>} | 
                        Service: {record.service_type || <span className="text-red-600">MISSING</span>}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {hasErrors && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-semibold">
                        {allErrors.length} issue{allErrors.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {!hasErrors && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-semibold">✓ Valid</span>
                    )}
                  </div>
                </div>

                {/* Expanded View */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t">
                    {/* Edit Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Name *</label>
                        <input
                          type="text"
                          value={getDisplayValue(0, idx, 'owner_name', record.owner_name || '')}
                          onChange={(e) => handleEditField(0, idx, 'owner_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${!getDisplayValue(0, idx, 'owner_name', record.owner_name || '') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          placeholder="Required"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                        <input
                          type="text"
                          value={getDisplayValue(0, idx, 'owner_phone', record.owner_phone || '')}
                          onChange={(e) => handleEditField(0, idx, 'owner_phone', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${!getDisplayValue(0, idx, 'owner_phone', record.owner_phone || '') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          placeholder="Required"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pet Name *</label>
                        <input
                          type="text"
                          value={getDisplayValue(0, idx, 'pet_name', record.pet_name || '')}
                          onChange={(e) => handleEditField(0, idx, 'pet_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${!getDisplayValue(0, idx, 'pet_name', record.pet_name || '') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          placeholder="Required"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Service Type *</label>
                        <select
                          value={getDisplayValue(0, idx, 'service_type', record.service_type || '')}
                          onChange={(e) => handleEditField(0, idx, 'service_type', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${!getDisplayValue(0, idx, 'service_type', record.service_type || '') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        >
                          <option value="">-- Select --</option>
                          <option value="adoption">Adoption</option>
                          <option value="rescue">Rescue</option>
                          <option value="medical">Medical</option>
                          <option value="lost_found">Lost & Found</option>
                          <option value="shelter">Shelter</option>
                          <option value="training">Training</option>
                          <option value="grooming">Grooming</option>
                          <option value="boarding">Boarding</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={getDisplayValue(0, idx, 'owner_email', record.owner_email || '')}
                          onChange={(e) => handleEditField(0, idx, 'owner_email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pet Species</label>
                        <input
                          type="text"
                          value={getDisplayValue(0, idx, 'pet_species', record.pet_species || '')}
                          onChange={(e) => handleEditField(0, idx, 'pet_species', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          placeholder="e.g., Dog, Cat, Bird"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Breed</label>
                        <input
                          type="text"
                          value={getDisplayValue(0, idx, 'breed', record.breed || '')}
                          onChange={(e) => handleEditField(0, idx, 'breed', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                        <select
                          value={getDisplayValue(0, idx, 'status', record.status || '')}
                          onChange={(e) => handleEditField(0, idx, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="">-- Select --</option>
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={getDisplayValue(0, idx, 'notes', record.notes || '')}
                        onChange={(e) => handleEditField(0, idx, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        rows="2"
                        placeholder="Optional notes"
                      />
                    </div>

                    {/* Errors */}
                    {hasErrors && allErrors.length > 0 && (
                      <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <p className="text-sm font-semibold text-red-800 mb-2">Validation Issues:</p>
                        <div className="space-y-1">
                          {allErrors.map((error, errIdx) => (
                            <div key={errIdx} className="flex items-start gap-2 text-sm text-red-700">
                              <span className="font-bold mt-0.5">•</span>
                              <span>{error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          ← Back to Upload
        </button>
        <button
          onClick={() => onConfirm(getRecordsToImport())}
          disabled={loading || !canImport}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          title={!canImport ? "No valid records to import" : ""}
        >
          {loading ? 'Importing...' : `✅ Import ${getRecordsToImport().filter(r => !r._hasErrors).length} Valid Records`}
        </button>
      </div>
    </div>
  );
};
