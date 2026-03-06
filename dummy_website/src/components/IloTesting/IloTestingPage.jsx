import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const IloTestingPage = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedDatacenter, setSelectedDatacenter] = useState('all');

  // Load initial stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/ilo-testing/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      const response = await fetch('/api/ilo-testing/test-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestResults(data.results);
        toast.success(`iLO test completed: ${data.results.successful} successful, ${data.results.failed + data.results.errors} failed`);
      } else {
        toast.error('Failed to run iLO tests');
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Error running iLO tests');
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'error': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'error': return '⚠️';
      default: return '❓';
    }
  };

  const filteredResults = testResults?.details?.filter(result => 
    selectedDatacenter === 'all' || result.datacenter === selectedDatacenter
  ) || [];

  const datacenters = stats ? Object.keys(stats.serversByDatacenter) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">🧪 iLO Connectivity Testing</h1>
          <p className="text-sm text-gray-600 mt-1">
            Test iLO connectivity across all servers using secure authentication
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalServers}</div>
                <div className="text-sm text-gray-600">Total Servers</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.serversWithIlo}</div>
                <div className="text-sm text-gray-600">With iLO Interface</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{datacenters.length}</div>
                <div className="text-sm text-gray-600">Datacenters</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((stats.serversWithIlo / stats.totalServers) * 100)}%
                </div>
                <div className="text-sm text-gray-600">iLO Coverage</div>
              </div>
            </div>

            {/* Datacenter Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">iLO Coverage by Datacenter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {datacenters.map(dc => (
                  <div key={dc} className="bg-white rounded p-3 text-sm">
                    <div className="font-medium text-gray-900">{dc}</div>
                    <div className="text-gray-600">
                      {stats.iloByDatacenter[dc]} / {stats.serversByDatacenter[dc]} servers
                      <span className="ml-2 text-xs text-gray-500">
                        ({Math.round((stats.iloByDatacenter[dc] / stats.serversByDatacenter[dc]) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Test Controls</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={runAllTests}
              disabled={testing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                testing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Testing...
                </>
              ) : (
                '🚀 Run All iLO Tests'
              )}
            </button>
            
            {testResults && (
              <div className="text-sm text-gray-600">
                Last test: {testResults.totalTested} servers tested
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
              <select
                value={selectedDatacenter}
                onChange={(e) => setSelectedDatacenter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Datacenters</option>
                {datacenters.map(dc => (
                  <option key={dc} value={dc}>{dc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-green-600">{testResults.successful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-red-600">{testResults.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-orange-600">{testResults.errors}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="p-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <div>
                        <div className="font-medium">{result.serverName}</div>
                        <div className="text-sm opacity-75">
                          {result.iloIP} • {result.datacenter}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {result.responseTime && (
                        <div className="font-medium">{result.responseTime}ms</div>
                      )}
                      {result.error && (
                        <div className="text-xs opacity-75">{result.error}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IloTestingPage;
