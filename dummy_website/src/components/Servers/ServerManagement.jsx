import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  PowerIcon,
  ArrowPathIcon,
  StopIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CpuChipIcon,
  CircuitBoardIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import serverService from '../../services/serverService'
import serverManagementService from '../../services/serverManagementService'
import LoadingSpinner from '../UI/LoadingSpinner'
import { toast } from 'react-hot-toast'

const ServerManagement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [server, setServer] = useState(null)
  const [serverInfo, setServerInfo] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadServerData()
  }, [id])

  const loadServerData = async () => {
    try {
      setLoading(true)

      // Load basic server info
      const serverResult = await serverService.getById(id)
      if (!serverResult.success) {
        toast.error('Server not found')
        navigate('/servers')
        return
      }

      setServer(serverResult.data)

      // Check if management interface is configured
      if (!serverResult.data.managementInterface?.enabled) {
        toast.error('Management interface not configured for this server')
        return
      }

      // Load management data
      await loadManagementData()

    } catch (error) {
      console.error('Error loading server data:', error)
      toast.error('Failed to load server data')
    } finally {
      setLoading(false)
    }
  }

  const loadManagementData = async () => {
    try {
      // Load server info, metrics, and logs in parallel
      const [infoResult, metricsResult, logsResult] = await Promise.allSettled([
        serverManagementService.getServerInfo(id),
        serverManagementService.getMetrics(id),
        serverManagementService.getLogs(id)
      ])

      if (infoResult.status === 'fulfilled' && infoResult.value.success) {
        setServerInfo(infoResult.value.data)
      }

      if (metricsResult.status === 'fulfilled' && metricsResult.value.success) {
        setMetrics(metricsResult.value.data)
      }

      if (logsResult.status === 'fulfilled' && logsResult.value.success) {
        setLogs(logsResult.value.data.logs || [])
      }
    } catch (error) {
      console.error('Error loading management data:', error)
    }
  }

  const handlePowerAction = async (action) => {
    try {
      setActionLoading(true)

      const result = await serverManagementService.powerControl(id, action)

      if (result.success) {
        toast.success(`Power ${action} command sent successfully`)
        // Refresh data after a short delay
        setTimeout(() => {
          refreshData()
        }, 2000)
      } else {
        toast.error(`Failed to execute power ${action}: ${result.error}`)
      }
    } catch (error) {
      console.error('Power action error:', error)
      toast.error('Failed to execute power command')
    } finally {
      setActionLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      setRefreshing(true)
      await loadManagementData()
      toast.success('Data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on':
      case 'online':
      case 'ok':
      case 'good':
        return 'text-green-600'
      case 'off':
      case 'offline':
        return 'text-gray-600'
      case 'error':
      case 'critical':
      case 'failed':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'on':
      case 'online':
      case 'ok':
      case 'good':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'off':
      case 'offline':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />
      case 'error':
      case 'critical':
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!server) {
    return (
      <div className="text-center py-12">
        <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Server not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested server could not be found.</p>
      </div>
    )
  }

  if (!server.managementInterface?.enabled) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Management Interface Not Configured</h3>
        <p className="mt-1 text-sm text-gray-500">
          This server does not have a management interface configured.
          Please configure iLO/iDRAC settings to enable remote management.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate(`/servers/${id}/edit`)}
            className="btn-primary"
          >
            Configure Management Interface
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ServerIcon className="h-8 w-8 mr-3 text-primary-600" />
            {server.name} Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {server.managementInterface?.type} • {server.managementInterface?.ip}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="btn-outline flex items-center"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Overview */}
      {serverInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {getStatusIcon(serverInfo.system?.powerState)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Power State</p>
                  <p className={`text-lg font-semibold ${getStatusColor(serverInfo.system?.powerState)}`}>
                    {serverInfo.system?.powerState || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {getStatusIcon(serverInfo.system?.status)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Health Status</p>
                  <p className={`text-lg font-semibold ${getStatusColor(serverInfo.system?.status)}`}>
                    {serverInfo.system?.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CpuChipIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">CPU Count</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {serverInfo.system?.processorSummary?.count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CircuitBoardIcon className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Memory (GB)</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {serverInfo.system?.memorySummary?.totalSystemMemoryGiB || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Power Control */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Power Control</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handlePowerAction('power_on')}
              disabled={actionLoading}
              className="btn-success flex items-center"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Power On
            </button>

            <button
              onClick={() => handlePowerAction('power_off')}
              disabled={actionLoading}
              className="btn-danger flex items-center"
            >
              <StopIcon className="h-4 w-4 mr-2" />
              Force Off
            </button>

            <button
              onClick={() => handlePowerAction('power_cycle')}
              disabled={actionLoading}
              className="btn-warning flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Power Cycle
            </button>

            <button
              onClick={() => handlePowerAction('graceful_shutdown')}
              disabled={actionLoading}
              className="btn-outline flex items-center"
            >
              <PowerIcon className="h-4 w-4 mr-2" />
              Graceful Shutdown
            </button>

            <button
              onClick={() => handlePowerAction('graceful_restart')}
              disabled={actionLoading}
              className="btn-outline flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Graceful Restart
            </button>
          </div>

          {actionLoading && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <LoadingSpinner size="sm" className="mr-2" />
              Executing power command...
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'System Overview' },
            { id: 'hardware', name: 'Hardware' },
            { id: 'network', name: 'Network' },
            { id: 'storage', name: 'Storage' },
            { id: 'logs', name: 'Logs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && serverInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg leading-6 font-medium text-gray-900">System Information</h3>
              </div>
              <div className="card-body">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                    <dd className="text-sm text-gray-900">{serverInfo.system?.manufacturer || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Model</dt>
                    <dd className="text-sm text-gray-900">{serverInfo.system?.model || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                    <dd className="text-sm text-gray-900">{serverInfo.system?.serialNumber || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">BIOS Version</dt>
                    <dd className="text-sm text-gray-900">{serverInfo.system?.biosVersion || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Power Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Power Information</h3>
              </div>
              <div className="card-body">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Power Consumed</dt>
                    <dd className="text-sm text-gray-900">
                      {serverInfo.system?.powerConsumption?.powerConsumedWatts || 'N/A'} W
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Power Capacity</dt>
                    <dd className="text-sm text-gray-900">
                      {serverInfo.system?.powerConsumption?.powerCapacityWatts || 'N/A'} W
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hardware' && serverInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Sensors */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Temperature Sensors</h3>
              </div>
              <div className="card-body">
                {serverInfo.system?.temperatures?.length > 0 ? (
                  <div className="space-y-3">
                    {serverInfo.system.temperatures.map((temp, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{temp.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{temp.readingCelsius}°C</span>
                          {getStatusIcon(temp.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No temperature data available</p>
                )}
              </div>
            </div>

            {/* Fan Status */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Fan Status</h3>
              </div>
              <div className="card-body">
                {serverInfo.system?.fans?.length > 0 ? (
                  <div className="space-y-3">
                    {serverInfo.system.fans.map((fan, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{fan.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {fan.reading} {fan.readingUnits}
                          </span>
                          {getStatusIcon(fan.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No fan data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && serverInfo && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Network Interfaces</h3>
            </div>
            <div className="card-body">
              {serverInfo.network?.interfaces?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interface
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MAC Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Link Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Speed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Addresses
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serverInfo.network.interfaces.map((iface, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {iface.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {iface.macAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              iface.linkStatus === 'LinkUp' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {iface.linkStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {iface.speedMbps ? `${iface.speedMbps} Mbps` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {iface.ipv4Addresses?.map(ip => ip.Address).join(', ') || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No network interface data available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'storage' && serverInfo && (
          <div className="space-y-6">
            {serverInfo.storage?.storageControllers?.map((controller, index) => (
              <div key={index} className="card">
                <div className="card-header">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {controller.name} ({controller.status})
                  </h3>
                </div>
                <div className="card-body">
                  {controller.drives?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Drive
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Model
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {controller.drives.map((drive, driveIndex) => (
                            <tr key={driveIndex}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {drive.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {drive.model}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {drive.capacityBytes ? `${Math.round(drive.capacityBytes / 1024 / 1024 / 1024)} GB` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {drive.mediaType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  drive.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {drive.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No drive data available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg leading-6 font-medium text-gray-900">System Logs</h3>
            </div>
            <div className="card-body">
              {logs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.slice(0, 20).map((log, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                              log.severity === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No logs available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServerManagement
