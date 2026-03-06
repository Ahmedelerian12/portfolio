import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { serversAPI } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import ServerForm from '../../components/Servers/ServerForm'
import ServerCard from '../../components/Servers/ServerCard'
import ServerGroupView from '../../components/ServerGroupView'

const Servers = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDatacenter, setSelectedDatacenter] = useState('')
  const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'paginated'
  const queryClient = useQueryClient()

  // Fetch servers with pagination (for paginated view)
  const { data: serversData, isLoading, error } = useQuery(
    ['servers', currentPage, searchTerm, selectedDatacenter],
    () => serversAPI.getAll({
      page: currentPage,
      limit: 50,
      search: searchTerm || undefined,
      datacenter: selectedDatacenter || undefined
    }),
    {
      select: (response) => response.data,
      keepPreviousData: true,
      enabled: viewMode === 'paginated'
    }
  )

  // Fetch all servers (for grouped view)
  const { data: allServersData, isLoading: allServersLoading, error: allServersError } = useQuery(
    ['all-servers', searchTerm, selectedDatacenter],
    () => serversAPI.getAll({
      limit: 10000, // Get all servers
      search: searchTerm || undefined,
      datacenter: selectedDatacenter || undefined
    }),
    {
      select: (response) => response.data,
      enabled: viewMode === 'grouped'
    }
  )

  // Fetch summary for datacenter filter options
  const { data: summaryData } = useQuery(
    'servers-summary',
    () => serversAPI.getSummary(),
    {
      select: (response) => response.data
    }
  )

  // Add server mutation
  const addServerMutation = useMutation(
    (serverData) => serversAPI.create(serverData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servers')
        queryClient.invalidateQueries('dashboard-servers') // Also invalidate dashboard
        setShowAddForm(false)
        toast.success('Server added successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add server')
      }
    }
  )

  // Delete server mutation
  const deleteServerMutation = useMutation(
    (serverId) => serversAPI.delete(serverId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servers')
        queryClient.invalidateQueries('dashboard-servers') // Also invalidate dashboard
        toast.success('Server deleted successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete server')
      }
    }
  )

  const handleAddServer = (serverData) => {
    addServerMutation.mutate(serverData)
  }

  const handleDeleteServer = (serverId) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      deleteServerMutation.mutate(serverId)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleDatacenterFilter = (e) => {
    setSelectedDatacenter(e.target.value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Determine current loading and error states based on view mode
  const currentLoading = viewMode === 'grouped' ? allServersLoading : isLoading
  const currentError = viewMode === 'grouped' ? allServersError : error
  const currentData = viewMode === 'grouped' ? allServersData : serversData

  if (currentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (currentError) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Error loading servers
        </h3>
        <p className="text-gray-500">
          {currentError.response?.data?.message || 'Something went wrong'}
        </p>
      </div>
    )
  }

  const servers = currentData?.servers || []
  const pagination = serversData?.pagination || {}
  const summary = currentData?.summary || {}
  const datacenters = summaryData ? Object.keys(summaryData.datacenters) : []

  // Debug logging
  console.log('🔍 Debug Info:', {
    viewMode,
    serversCount: servers.length,
    totalFromSummary: summaryData?.totalServers,
    totalFromPagination: pagination.total,
    currentDataKeys: currentData ? Object.keys(currentData) : 'no data'
  })

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Server Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor your server infrastructure ({summaryData?.totalServers?.toLocaleString() || servers.length.toLocaleString()} total servers).
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'grouped'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              📊 Grouped
            </button>
            <button
              onClick={() => setViewMode('paginated')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'paginated'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              📄 List
            </button>
          </div>

            )}
        </button>

        <button
          onClick={() => {
            // Logic to export iLO IPs
            const serversToExport = selectedDatacenter
              ? servers.filter(s => s.location?.datacenter === selectedDatacenter)
              : servers;

            if (serversToExport.length === 0) {
              toast.error('No servers to export');
              return;
            }

            const headers = ['Server Name', 'Datacenter', 'iLO IP', 'Model', 'Serial'];
            const csvRows = [headers.join(',')];

            serversToExport.forEach(server => {
              const iloIp = server.managementInterface?.ip || 'N/A';
              const row = [
                server.name,
                server.location?.datacenter || 'N/A',
                iloIp,
                server.model || 'N/A',
                server.serial || 'N/A'
              ];
              csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ilo_ips_${selectedDatacenter || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success(`Exported ${serversToExport.length} iLO IPs`);
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 -ml-1 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export iLO IPs
        </button>
      </div>
    </div>

      {/* Search and Filter Controls */ }
  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
        Search Servers
      </label>
      <input
        type="text"
        id="search"
        placeholder="Search by name, IP address..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      />
    </div>

    <div>
      <label htmlFor="datacenter" className="block text-sm font-medium text-gray-700 mb-1">
        Filter by Datacenter
      </label>
      <select
        id="datacenter"
        value={selectedDatacenter}
        onChange={handleDatacenterFilter}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="">All Datacenters</option>
        {datacenters.map(dc => (
          <option key={dc} value={dc}>{dc}</option>
        ))}
      </select>
    </div>

    <div className="flex items-end">
      <div className="text-sm text-gray-600">
        Showing {servers.length} of {pagination.total?.toLocaleString() || 0} servers
        {pagination.pages > 1 && (
          <span className="ml-2">
            (Page {pagination.page} of {pagination.pages})
          </span>
        )}
      </div>
    </div>
  </div>

  {/* Add Server Form */ }
  {
    showAddForm && (
      <div className="mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Add New Server</h3>
          </div>
          <div className="card-body">
            <ServerForm
              onSubmit={handleAddServer}
              onCancel={() => setShowAddForm(false)}
              isLoading={addServerMutation.isLoading}
            />
          </div>
        </div>
      </div>
    )
  }

  {/* Servers List */ }
  {
    servers.length === 0 ? (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No servers configured
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first server to the system.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add Your First Server
            </button>
          </div>
        </div>
      </div>
    ) : viewMode === 'grouped' ? (
      <ServerGroupView
        servers={servers}
        onManage={(server) => window.open(`/servers/${server._id}/manage`, '_blank')}
        onEdit={(server) => console.log('Edit server:', server)}
        onDelete={(server) => handleDeleteServer(server._id)}
        onExportToNotepad={(serverId) => console.log('Export server:', serverId)}
      />
    ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servers.map((server) => (
        <ServerCard
          key={server._id}
          server={server}
          onDelete={() => handleDeleteServer(server._id)}
          isDeleting={deleteServerMutation.isLoading}
        />
      ))}
    </div>
  )
  }

  {/* Pagination Controls - Only show in paginated mode */ }
  {
    viewMode === 'paginated' && pagination.pages > 1 && (
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
            const page = i + Math.max(1, currentPage - 2)
            if (page > pagination.pages) return null

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${page === currentPage
                    ? 'text-white bg-primary-600 border border-primary-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            )
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    )
  }
    </div >
  )
}

export default Servers
