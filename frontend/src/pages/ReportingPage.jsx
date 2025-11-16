import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ReportingPage = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('outcomes');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      let endpoint = '';
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', `${startDate}T00:00:00Z`);
      if (endDate) params.append('endDate', `${endDate}T23:59:59Z`);

      switch (reportType) {
        case 'outcomes':
          endpoint = `/api/reports/case-outcomes?${params}`;
          break;
        case 'effectiveness':
          endpoint = `/api/reports/program-effectiveness?${params}`;
          break;
        case 'species':
          endpoint = `/api/reports/species-analysis?${params}`;
          break;
        case 'detailed-outcomes':
          endpoint = `/api/reports/case-outcomes-detailed?${params}`;
          break;
        default:
          throw new Error('Invalid report type');
      }

      const response = await api.get(endpoint);
      setReportData(response.data);
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    let rows = [];

    if (reportType === 'outcomes' && reportData.outcomes) {
      rows.push(['Outcome', 'Count', 'Percentage']);
      reportData.outcomes.forEach(row => {
        rows.push([row.outcome, row.count, row.percentage + '%']);
      });
    } else if (reportType === 'effectiveness' && reportData.casesByService) {
      rows.push(['Program Effectiveness Report']);
      rows.push(['Total Cases', reportData.totalCases]);
      rows.push(['']);
      rows.push(['Service Type', 'Count']);
      reportData.casesByService.forEach(row => {
        rows.push([row.service_type, row.count]);
      });
      rows.push(['']);
      rows.push(['Outcome', 'Count']);
      reportData.outcomeBreakdown.forEach(row => {
        rows.push([row.outcome, row.count]);
      });
    } else if (reportType === 'species' && reportData.species) {
      rows.push(['Species', 'Total Cases', 'Outcomes Recorded', 'Service Types']);
      reportData.species.forEach(row => {
        rows.push([row.pet_species, row.count, row.outcomes_recorded, row.service_types]);
      });
    } else if (reportType === 'detailed-outcomes' && reportData.cases) {
      rows.push(['Case ID', 'Owner', 'Pet Name', 'Species', 'Service Type', 'Status', 'Outcome', 'Created Date']);
      reportData.cases.forEach(row => {
        rows.push([
          row.id,
          row.owner_name,
          row.pet_name,
          row.pet_species,
          row.service_type,
          row.status,
          row.outcome,
          new Date(row.created_at).toLocaleDateString()
        ]);
      });
    }

    csvContent += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">PHCS</h1>
            <p className="text-blue-100">Reports & Analytics</p>
          </div>
          <div className="flex gap-4">
            <Link to="/cases" className="text-blue-100 hover:text-white">
              Cases
            </Link>
            <Link to="/" className="text-blue-100 hover:text-white">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Report Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Generate Reports</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportData(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="outcomes">Case Outcomes Summary</option>
                <option value="effectiveness">Program Effectiveness</option>
                <option value="species">Species Analysis</option>
                <option value="detailed-outcomes">Detailed Case Outcomes</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              {loading ? 'Generating...' : '📊 Generate Report'}
            </button>
            {reportData && (
              <button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                📥 Export as CSV
              </button>
            )}
          </div>
        </div>

        {/* Report Display */}
        {reportData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Report Results</h2>

            {reportType === 'outcomes' && reportData.outcomes && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Case Outcomes Distribution</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Outcome</th>
                        <th className="px-4 py-2 text-right">Count</th>
                        <th className="px-4 py-2 text-right">Percentage</th>
                        <th className="px-4 py-2 text-center">Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.outcomes.map((outcome, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold">{outcome.outcome}</td>
                          <td className="px-4 py-2 text-right">{outcome.count}</td>
                          <td className="px-4 py-2 text-right font-semibold">{outcome.percentage}%</td>
                          <td className="px-4 py-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${outcome.percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'effectiveness' && reportData.casesByService && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Program Effectiveness Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-sm text-gray-600">Total Cases</p>
                    <p className="text-3xl font-bold text-blue-600">{reportData.totalCases}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <p className="text-sm text-gray-600">Service Types</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.casesByService.length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded border border-purple-200">
                    <p className="text-sm text-gray-600">Outcomes Recorded</p>
                    <p className="text-3xl font-bold text-purple-600">{reportData.outcomeBreakdown.length}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Cases by Service Type</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Service Type</th>
                            <th className="px-4 py-2 text-right">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.casesByService.map((service, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{service.service_type}</td>
                              <td className="px-4 py-2 text-right font-semibold">{service.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Outcome Breakdown</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Outcome</th>
                            <th className="px-4 py-2 text-right">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.outcomeBreakdown.map((outcome, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{outcome.outcome}</td>
                              <td className="px-4 py-2 text-right font-semibold">{outcome.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'species' && reportData.species && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Species Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Species</th>
                        <th className="px-4 py-2 text-right">Total Cases</th>
                        <th className="px-4 py-2 text-right">Outcomes Recorded</th>
                        <th className="px-4 py-2 text-right">Service Types</th>
                        <th className="px-4 py-2 text-right">Coverage %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.species.map((species, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold">{species.pet_species || 'Unknown'}</td>
                          <td className="px-4 py-2 text-right">{species.count}</td>
                          <td className="px-4 py-2 text-right">{species.outcomes_recorded}</td>
                          <td className="px-4 py-2 text-right">{species.service_types}</td>
                          <td className="px-4 py-2 text-right font-semibold">
                            {species.count > 0 ? Math.round((species.outcomes_recorded / species.count) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'detailed-outcomes' && reportData.cases && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Case Outcomes Details ({reportData.cases.length} cases)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Owner</th>
                        <th className="px-4 py-2 text-left">Pet</th>
                        <th className="px-4 py-2 text-left">Species</th>
                        <th className="px-4 py-2 text-left">Service</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-left">Outcome</th>
                        <th className="px-4 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.cases.map((caseItem, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{caseItem.owner_name}</td>
                          <td className="px-4 py-2">{caseItem.pet_name}</td>
                          <td className="px-4 py-2">{caseItem.pet_species}</td>
                          <td className="px-4 py-2">{caseItem.service_type}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              caseItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                              caseItem.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              caseItem.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              {caseItem.outcome || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-600">{new Date(caseItem.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!reportData && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-gray-700 mb-2">📊 Select report type and date range above to generate reports</p>
            <p className="text-sm text-gray-600">Reports help track program effectiveness and case outcomes</p>
          </div>
        )}
      </main>
    </div>
  );
};
