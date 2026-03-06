import { Link } from 'react-router-dom'
import {
  ServerIcon,
  ComputerDesktopIcon,
  CubeIcon,
  TrashIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const ServerCard = ({ server, onDelete, isDeleting }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100'
      case 'offline':
        return 'text-red-600 bg-red-100'
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'physical':
        return <ServerIcon className="h-6 w-6" />
      case 'virtual':
        return <ComputerDesktopIcon className="h-6 w-6" />
      case 'container':
        return <CubeIcon className="h-6 w-6" />
      default:
        return <ServerIcon className="h-6 w-6" />
    }
  }

  const getEnvironmentColor = (environment) => {
    switch (environment) {
      case 'production':
        return 'bg-red-100 text-red-800'
      case 'staging':
        return 'bg-yellow-100 text-yellow-800'
      case 'development':
        return 'bg-blue-100 text-blue-800'
      case 'testing':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Check if server has password configured
  const hasPassword = server.managementInterface?.password &&
                     server.managementInterface.password.trim() !== ''

  // Get card background color based on password status
  const getCardBackgroundColor = () => {
    if (!hasPassword) {
      return 'bg-yellow-50 border-yellow-200' // Yellow background for missing password
    }
    return 'bg-white border-gray-200' // Normal white background
  }

  return (
    <div className={`card hover:shadow-lg transition-shadow duration-200 border ${getCardBackgroundColor()}`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-gray-600">
              {getTypeIcon(server.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {server.name}
              </h3>
              <div className="text-sm text-gray-500">
                <div>{server.ipAddress}</div>
                {server.additionalIPs && server.additionalIPs.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1 space-y-1">
                    {server.additionalIPs.map((ip, index) => (
                      <div key={index} className="text-blue-600">{ip}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Password Warning */}
          <div className="flex flex-col items-end space-y-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
              {server.status || 'unknown'}
            </span>
            {!hasPassword && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠️ No Password
              </span>
            )}
          </div>
        </div>

        {/* Server Details */}
        <div className="space-y-2 mb-4">
          {server.hostname && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hostname:</span>
              <span className="text-gray-900">{server.hostname}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="text-gray-900 capitalize">{server.type}</span>
          </div>

          {server.environment && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Environment:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEnvironmentColor(server.environment)}`}>
                {server.environment}
              </span>
            </div>
          )}

          {server.os?.name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">OS:</span>
              <span className="text-gray-900">
                {server.os.name} {server.os.version}
              </span>
            </div>
          )}

          {server.location?.datacenter && (
            <div className="text-sm">
              <span className="text-gray-500">Location:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  🏢 {server.location.datacenter}
                </span>
                {server.location.rack && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    🗄️ {server.location.rack}
                  </span>
                )}
                {server.location.position && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    📍 {server.location.position}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Additional IPs */}
          {server.additionalIPs && server.additionalIPs.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">Additional IPs:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {server.additionalIPs.slice(0, 3).map((ip, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {ip}
                  </span>
                ))}
                {server.additionalIPs.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    +{server.additionalIPs.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* iLO Additional IPs */}
          {server.managementInterface?.additionalIPs && server.managementInterface.additionalIPs.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">iLO Additional IPs:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {server.managementInterface.additionalIPs.slice(0, 3).map((ip, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {ip}
                  </span>
                ))}
                {server.managementInterface.additionalIPs.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    +{server.managementInterface.additionalIPs.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {server.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {server.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Added {new Date(server.createdAt).toLocaleDateString()}
          </div>

          <div className="flex space-x-2">
            <Link
              to={`/servers/${server._id}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View
            </Link>

            {/* Management Button - only show if management interface is configured */}
            {server.managementInterface?.enabled && (
              <Link
                to={`/servers/${server._id}/manage`}
                className="inline-flex items-center px-3 py-1.5 border border-primary-300 text-xs font-medium rounded text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <CogIcon className="h-4 w-4 mr-1" />
                Manage
              </Link>
            )}

            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerCard
