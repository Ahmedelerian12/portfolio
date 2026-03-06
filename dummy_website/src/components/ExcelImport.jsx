/**
 * Excel Import Component for IstqSERVERS
 *
 * Handles importing server data from Excel files with datacenter tagging
 * and duplicate prevention.
 */

import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';

const ExcelImport = ({ onImportComplete, onCancel }) => {
  const [importStatus, setImportStatus] = useState(null);
  const [datacenterStats, setDatacenterStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [datacenterName, setDatacenterName] = useState('Valencia');
  const [importResults, setImportResults] = useState(null);

  // Load import status on component mount
  useEffect(() => {
    loadImportStatus();
  }, []);

  const loadImportStatus = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading Excel import status...');

      const response = await apiCall(API_ENDPOINTS.EXCEL_IMPORT.STATUS);

      if (response && response.ok) {
        const data = await response.json();
        setImportStatus(data.importStatus);
        setDatacenterStats(data.datacenterStats);
        console.log('✅ Import status loaded:', data);
      } else if (response) {
        const error = await response.json();
        console.error('❌ Failed to load import status:', error);
      }
    } catch (error) {
      console.error('❌ Import status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportServers = async () => {
    if (!datacenterName.trim()) {
      alert('❌ Please enter a datacenter name');
      return;
    }

    try {
      setImporting(true);
      setImportResults(null);
      console.log(`📊 Starting Excel import for datacenter: ${datacenterName}`);

      const response = await apiCall(API_ENDPOINTS.EXCEL_IMPORT.SERVERS, {
        method: 'POST',
        body: JSON.stringify({
          datacenter: datacenterName.trim()
        })
      });

      if (response && response.ok) {
        const result = await response.json();
        setImportResults(result);
        console.log('✅ Import successful:', result);

        // Refresh status after import
        await loadImportStatus();

        // Notify parent component
        if (onImportComplete) {
          onImportComplete(result);
        }

        alert(`✅ Excel import completed!\n\n📊 Summary:\n• Imported: ${result.summary.imported} servers\n• Updated: ${result.summary.updated} servers\n• Skipped: ${result.summary.skipped} servers\n• Datacenter: ${result.summary.datacenter}`);

      } else if (response) {
        const error = await response.json();
        console.error('❌ Import failed:', error);
        alert(`❌ Import failed: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('❌ Import error:', error);
      alert(`❌ Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="excel-import-container">
      <div className="excel-import-header">
        {onCancel && (
          <button
            onClick={onCancel}
            className="back-button"
          >
            ← Back to Servers
          </button>
        )}
        <h2>📊 Excel Data Import</h2>
        <p>Import server data from Excel files with datacenter tagging</p>
      </div>

      {/* Import Status */}
      <div className="import-status-section">
        <h3>📁 Excel File Status</h3>
        {loading ? (
          <div className="loading">Loading import status...</div>
        ) : importStatus ? (
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Excel Parser:</span>
              <span className={`status-value ${importStatus.excelParserExists ? 'success' : 'error'}`}>
                {importStatus.excelParserExists ? '✅ Available' : '❌ Not Found'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">JSON Data File:</span>
              <span className={`status-value ${importStatus.jsonFileExists ? 'success' : 'error'}`}>
                {importStatus.jsonFileExists ? '✅ Ready' : '❌ Not Found'}
              </span>
            </div>
            {importStatus.jsonFileExists && (
              <>
                <div className="status-item">
                  <span className="status-label">File Size:</span>
                  <span className="status-value">{formatFileSize(importStatus.jsonFileSize)}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Servers in File:</span>
                  <span className="status-value">{importStatus.serversInFile}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Last Modified:</span>
                  <span className="status-value">{formatDate(importStatus.lastModified)}</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="error">Failed to load import status</div>
        )}
      </div>

      {/* Datacenter Statistics */}
      <div className="datacenter-stats-section">
        <h3>🏢 Current Datacenter Distribution</h3>
        {Object.keys(datacenterStats).length > 0 ? (
          <div className="datacenter-grid">
            {Object.entries(datacenterStats).map(([datacenter, count]) => (
              <div key={datacenter} className="datacenter-item">
                <span className="datacenter-name">{datacenter}</span>
                <span className="datacenter-count">{count} servers</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No servers found in database</div>
        )}
      </div>

      {/* Import Controls */}
      <div className="import-controls-section">
        <h3>📥 Import Servers</h3>
        <div className="import-form">
          <div className="form-group">
            <label htmlFor="datacenterName">Datacenter Name:</label>
            <input
              type="text"
              id="datacenterName"
              value={datacenterName}
              onChange={(e) => setDatacenterName(e.target.value)}
              placeholder="Enter datacenter name (e.g., Valencia, Madrid, Barcelona)"
              disabled={importing}
            />
          </div>
          <button
            onClick={handleImportServers}
            disabled={importing || !importStatus?.jsonFileExists || !datacenterName.trim()}
            className="import-button"
          >
            {importing ? '⏳ Importing...' : '📥 Import Servers'}
          </button>
        </div>

        {!importStatus?.jsonFileExists && (
          <div className="import-warning">
            ⚠️ Excel data file not found. Please ensure you have:
            <ol>
              <li>Placed your Excel file in the excel-parser folder</li>
              <li>Named it 'servers.xlsx'</li>
              <li>Run the parser script to generate the JSON file</li>
            </ol>
          </div>
        )}
      </div>

      {/* Import Results */}
      {importResults && (
        <div className="import-results-section">
          <h3>📊 Import Results</h3>
          <div className="results-summary">
            <div className="summary-item">
              <span className="summary-label">Total Processed:</span>
              <span className="summary-value">{importResults.summary.totalProcessed}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Imported:</span>
              <span className="summary-value success">{importResults.summary.imported}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Updated:</span>
              <span className="summary-value warning">{importResults.summary.updated}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Skipped:</span>
              <span className="summary-value info">{importResults.summary.skipped}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Datacenter:</span>
              <span className="summary-value">{importResults.summary.datacenter}</span>
            </div>
          </div>

          {importResults.results && importResults.results.length > 0 && (
            <div className="detailed-results">
              <h4>Detailed Results (First 10):</h4>
              <div className="results-list">
                {importResults.results.slice(0, 10).map((result, index) => (
                  <div key={index} className={`result-item ${result.action}`}>
                    <span className="server-tag">{result.serverTag}</span>
                    <span className="action-badge">{result.action}</span>
                    <span className="message">{result.message}</span>
                  </div>
                ))}
                {importResults.results.length > 10 && (
                  <div className="more-results">
                    ... and {importResults.results.length - 10} more results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .excel-import-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .excel-import-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .excel-import-header h2 {
          color: #333;
          margin-bottom: 10px;
        }

        .excel-import-header p {
          color: #666;
          font-size: 16px;
        }

        .back-button {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 5px 0;
          text-align: left;
          width: 100%;
        }

        .back-button:hover {
          color: #0056b3;
          text-decoration: underline;
        }

        .import-status-section,
        .datacenter-stats-section,
        .import-controls-section,
        .import-results-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .import-status-section h3,
        .datacenter-stats-section h3,
        .import-controls-section h3,
        .import-results-section h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
        }

        .status-grid,
        .datacenter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .status-item,
        .datacenter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .status-label,
        .datacenter-name {
          font-weight: 500;
          color: #555;
        }

        .status-value {
          font-weight: 600;
        }

        .status-value.success {
          color: #28a745;
        }

        .status-value.error {
          color: #dc3545;
        }

        .datacenter-count {
          background: #007bff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .import-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-weight: 500;
          color: #555;
        }

        .form-group input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .import-button {
          padding: 12px 24px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .import-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .import-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .import-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 15px;
          margin-top: 15px;
          color: #856404;
        }

        .import-warning ol {
          margin: 10px 0 0 20px;
        }

        .results-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .summary-label {
          font-weight: 500;
          color: #555;
        }

        .summary-value {
          font-weight: 600;
        }

        .summary-value.success {
          color: #28a745;
        }

        .summary-value.warning {
          color: #ffc107;
        }

        .summary-value.info {
          color: #17a2b8;
        }

        .results-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .result-item {
          display: grid;
          grid-template-columns: 100px 80px 1fr;
          gap: 10px;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-item.imported {
          background: #d4edda;
        }

        .result-item.updated {
          background: #fff3cd;
        }

        .result-item.skipped {
          background: #d1ecf1;
        }

        .result-item.error {
          background: #f8d7da;
        }

        .server-tag {
          font-weight: 600;
          color: #333;
        }

        .action-badge {
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }

        .result-item.imported .action-badge {
          background: #28a745;
        }

        .result-item.updated .action-badge {
          background: #ffc107;
          color: #333;
        }

        .result-item.skipped .action-badge {
          background: #17a2b8;
        }

        .result-item.error .action-badge {
          background: #dc3545;
        }

        .message {
          font-size: 13px;
          color: #666;
        }

        .more-results {
          padding: 10px;
          text-align: center;
          color: #666;
          font-style: italic;
        }

        .loading,
        .error,
        .no-data {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .error {
          color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default ExcelImport;
