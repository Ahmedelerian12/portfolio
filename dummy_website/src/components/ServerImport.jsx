import { useState } from 'react'
import * as XLSX from 'xlsx'

const ServerImport = ({ onImport, onCancel }) => {
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState([])
  const [mapping, setMapping] = useState({
    name: '',
    ipAddress: '',
    vendor: '',
    model: '',
    iloIp: '',
    datacenter: '',
    rack: '',
    position: '',
    serverNetworkDescription: '',
    iloNetworkDescription: ''
  })
  const [importing, setImporting] = useState(false)

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0]
    if (!uploadedFile) return

    setFile(uploadedFile)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length > 0) {
          const headers = jsonData[0]
          const rows = jsonData.slice(1, 6) // Show first 5 rows for preview

          setPreviewData({ headers, rows })

          // Auto-detect common column mappings
          const autoMapping = { ...mapping }
          headers.forEach((header, index) => {
            const lowerHeader = header?.toString().toLowerCase() || ''
            if (lowerHeader.includes('name') || lowerHeader.includes('server')) {
              autoMapping.name = index
            } else if (lowerHeader.includes('ip') && !lowerHeader.includes('ilo')) {
              autoMapping.ipAddress = index
            } else if (lowerHeader.includes('vendor') || lowerHeader.includes('manufacturer')) {
              autoMapping.vendor = index
            } else if (lowerHeader.includes('model')) {
              autoMapping.model = index
            } else if (lowerHeader.includes('ilo') && lowerHeader.includes('ip')) {
              autoMapping.iloIp = index
            } else if (lowerHeader.includes('datacenter') || lowerHeader.includes('dc')) {
              autoMapping.datacenter = index
            } else if (lowerHeader.includes('rack')) {
              autoMapping.rack = index
            } else if (lowerHeader.includes('position') || lowerHeader.includes('u')) {
              autoMapping.position = index
            }
          })
          setMapping(autoMapping)
        }
      } catch (error) {
        alert('Error reading Excel file: ' + error.message)
      }
    }
    reader.readAsArrayBuffer(uploadedFile)
  }

  const handleImport = async () => {
    if (!file || !previewData.headers) {
      alert('Please select a file first')
      return
    }

    setImporting(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          const rows = jsonData.slice(1) // Skip header row
          const servers = []

          rows.forEach((row, index) => {
            // Skip empty rows
            if (!row || row.every(cell => !cell)) return

            const server = {
              name: row[mapping.name] || `Server-${index + 1}`,
              ipAddress: row[mapping.ipAddress] || '',
              type: 'physical',
              vendor: row[mapping.vendor] || 'HPE',
              model: row[mapping.model] || '',
              managementInterface: {
                type: 'iLO',
                ip: row[mapping.iloIp] || '',
                username: 'team',
                password: 'kc4^QOVuzRn5',
                enabled: true
              },
              networkInfo: {
                serverNetworkDescription: row[mapping.serverNetworkDescription] || '',
                iloNetworkDescription: row[mapping.iloNetworkDescription] || ''
              },
              location: {
                datacenter: row[mapping.datacenter] || '',
                rack: row[mapping.rack] || '',
                position: row[mapping.position] || ''
              },
              status: 'offline',
              powerState: 'Unknown'
            }

            // Only add servers with at least a name
            if (server.name && server.name.trim()) {
              servers.push(server)
            }
          })

          console.log(`📊 Importing ${servers.length} servers from Excel...`)
          await onImport(servers)

        } catch (error) {
          console.error('Import error:', error)
          alert('Error importing servers: ' + error.message)
        } finally {
          setImporting(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('File read error:', error)
      alert('Error reading file: ' + error.message)
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Import Servers from Excel</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File (.xlsx, .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Column Mapping */}
          {previewData.headers && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Map Excel Columns to Server Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mapping).map(([field, value]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                      {['name', 'ipAddress'].includes(field) && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Select Column --</option>
                      {previewData.headers.map((header, index) => (
                        <option key={index} value={index}>
                          {header || `Column ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {previewData.headers && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Preview (First 5 rows)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData.headers.map((header, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {previewData.headers.map((_, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[colIndex] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* iLO Credentials Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">🔐</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">iLO Credentials</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <p>All imported servers will be configured with:</p>
                  <p><strong>Username:</strong> team</p>
                  <p><strong>Password:</strong> kc4^QOVuzRn5 (automatically encrypted)</p>
                  <p>You can modify these credentials after import if needed.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importing || !file || !mapping.name}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import Servers'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerImport
