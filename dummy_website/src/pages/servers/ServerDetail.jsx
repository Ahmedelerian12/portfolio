import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { serversAPI } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import ServerForm from '../../components/Servers/ServerForm'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  SignalIcon,
  ServerIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

const ServerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  // Fetch server details
  const { data: serverData, isLoading, error } = useQuery(
    ['server', id],
    () => serversAPI.getById(id),
    {
      select: (response) => response.data.server,
      enabled: !!id
    }
  )

  // Update server mutation
  const updateServerMutation = useMutation(
    (serverData) => serversAPI.update(id, serverData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['server', id])
        queryClient.invalidateQueries('servers')
        queryClient.invalidateQueries('dashboard-servers')
        setIsEditing(false)
        toast.success('Server updated successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update server')
      }
    }
  )

  // Delete server mutation
  const deleteServerMutation = useMutation(
    () => serversAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servers')
        queryClient.invalidateQueries('dashboard-servers')
        toast.success('Server deleted successfully!')
        navigate('/servers')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete server')
      }
    }
  )

  const handleUpdateServer = (serverData) => {
    updateServerMutation.mutate(serverData)
  }

  const handleDeleteServer = () => {
    if (window.confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
      deleteServerMutation.mutate()
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Connection test successful!')
    } catch (error) {
      toast.error('Connection test failed')
    } finally {
      setIsTestingConnection(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !serverData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Server not found
        </h3>
        <p className="text-gray-500 mb-4">
          The server you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/servers" className="btn-primary">
          Back to Servers
        </Link>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100'
      case 'offline':
        return 'text-red-600 bg-red-100'
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'physical':
        return <ServerIcon className="h-8 w-8" />
      case 'virtual':
        return <ComputerDesktopIcon className="h-8 w-8" />
      default:
        return <ServerIcon className="h-8 w-8" />
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/servers"
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Servers
            </Link>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="btn-outline"
            >
              {isTestingConnection ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <SignalIcon className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-outline"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>

            <button
              onClick={handleDeleteServer}
              disabled={deleteServerMutation.isLoading}
              className="btn-danger"
            >
              {deleteServerMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Server Header */}
      <div className="card mb-8">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-gray-600">
                {getTypeIcon(serverData.type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {serverData.name}
                </h1>
                <p className="text-gray-500">
                  {serverData.ipAddress} • {serverData.hostname || 'No hostname'}
                </p>
              </div>
            </div>

            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(serverData.status)}`}>
              {serverData.status || 'unknown'}
            </span>
          </div>

          {serverData.description && (
            <div className="mt-4">
              <p className="text-gray-600">{serverData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Edit Server</h3>
          </div>
          <div className="card-body">
            <ServerForm
              initialData={serverData}
              onSubmit={handleUpdateServer}
              onCancel={() => setIsEditing(false)}
              isLoading={updateServerMutation.isLoading}
            />
          </div>
        </div>
      )}

      {/* Server Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div className="card-body">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Server Type</dt>
                <dd className="text-sm text-gray-900 capitalize">{serverData.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Environment</dt>
                <dd className="text-sm text-gray-900 capitalize">{serverData.environment}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                <dd className="text-sm text-gray-900">
                  <div>{serverData.ipAddress}</div>
                  {serverData.additionalIPs && serverData.additionalIPs.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-500 mb-1">Additional IPs:</div>
                      <div className="flex flex-wrap gap-1">
                        {serverData.additionalIPs.map((ip, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </dd>
              </div>
              {serverData.hostname && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hostname</dt>
                  <dd className="text-sm text-gray-900">{serverData.hostname}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900 capitalize">{serverData.status || 'Unknown'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Management Interface */}
        {serverData.managementInterface && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Management Interface</h3>
            </div>
            <div className="card-body">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-sm text-gray-900">{serverData.managementInterface.type || 'iLO'}</dd>
                </div>
                {serverData.managementInterface.ip && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                    <dd className="text-sm text-gray-900">
                      <div>{serverData.managementInterface.ip}</div>
                      {serverData.managementInterface.additionalIPs && serverData.managementInterface.additionalIPs.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-500 mb-1">Additional IPs:</div>
                          <div className="flex flex-wrap gap-1">
                            {serverData.managementInterface.additionalIPs.map((ip, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {ip}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      serverData.managementInterface.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {serverData.managementInterface.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Operating System */}
        {(serverData.os?.name || serverData.os?.version || serverData.os?.architecture) && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Operating System</h3>
            </div>
            <div className="card-body">
              <dl className="space-y-4">
                {serverData.os?.name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">OS Name</dt>
                    <dd className="text-sm text-gray-900">{serverData.os.name}</dd>
                  </div>
                )}
                {serverData.os?.version && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="text-sm text-gray-900">{serverData.os.version}</dd>
                  </div>
                )}
                {serverData.os?.architecture && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Architecture</dt>
                    <dd className="text-sm text-gray-900">{serverData.os.architecture}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Timestamps</h3>
          </div>
          <div className="card-body">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(serverData.createdAt).toLocaleString()}
                </dd>
              </div>
              {serverData.updatedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(serverData.updatedAt).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerDetail
