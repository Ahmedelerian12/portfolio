import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuth } from '../context/AuthContext'
import { serversAPI } from '../services/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  ServerIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user } = useAuth()

  // Fetch server summary for dashboard stats (optimized for large datasets)
  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    'dashboard-summary',
    () => serversAPI.getSummary(),
    {
      select: (response) => response.data,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  )

  // Fetch recent servers separately with pagination
  const { data: recentServersData, isLoading: recentServersLoading } = useQuery(
    'dashboard-recent-servers',
    () => serversAPI.getAll({ limit: 5, page: 1 }),
    {
      select: (response) => response.data,
      refetchInterval: 60000, // Refresh every minute
    }
  )

  const servers = recentServersData?.servers || []
  const serverStats = summaryData ? {
    total: summaryData.totalServers,
    online: Object.values(summaryData.datacenters).reduce((sum, dc) => sum + dc.online, 0),
    offline: Object.values(summaryData.datacenters).reduce((sum, dc) => sum + dc.offline, 0),
    maintenance: 0, // Will be calculated from actual status data
    datacenters: Object.keys(summaryData.datacenters).length
  } : {
    total: 0,
    online: 0,
    offline: 0,
    maintenance: 0,
    datacenters: 0
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🖥️</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your infrastructure today.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 bg-primary-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/servers" className="btn-primary">
            <ServerIcon className="h-4 w-4 mr-2" />
            Manage Servers
          </Link>
          <Link to="/network" className="btn-outline">
            <GlobeAltIcon className="h-4 w-4 mr-2" />
            Network Config
          </Link>
          <Link to="/monitoring" className="btn-outline">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            View Monitoring
          </Link>
          <Link to="/automation" className="btn-outline">
            <CogIcon className="h-4 w-4 mr-2" />
            Automation
          </Link>
        </div>
      </div>

      {/* Stats Grid - Now Clickable */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link to="/servers" className="card hover:shadow-lg transition-shadow duration-200 group">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <ServerIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Servers
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {summaryLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      serverStats.total.toLocaleString()
                    )}
                  </dd>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>
        </Link>

        <Link to="/servers" className="card hover:shadow-lg transition-shadow duration-200 group">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Datacenters
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {summaryLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      serverStats.datacenters
                    )}
                  </dd>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>
        </Link>

        <Link to="/monitoring" className="card hover:shadow-lg transition-shadow duration-200 group">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Alerts
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">0</dd>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>
        </Link>

        <Link to="/automation" className="card hover:shadow-lg transition-shadow duration-200 group">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <CogIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Running Jobs
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">0</dd>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Servers
            </h3>
            <Link to="/servers" className="text-sm text-primary-600 hover:text-primary-500">
              View all →
            </Link>
          </div>
          <div className="card-body">
            {recentServersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : servers.length === 0 ? (
              <div className="text-center py-8">
                <ServerIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No servers configured yet</p>
                <Link to="/servers" className="btn-primary">
                  Add Your First Server
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {servers.slice(0, 3).map((server) => (
                  <div key={server._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        server.status === 'online' ? 'bg-green-500' :
                        server.status === 'offline' ? 'bg-red-500' :
                        server.status === 'maintenance' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{server.name}</p>
                        <p className="text-xs text-gray-500">{server.ipAddress}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      server.status === 'online' ? 'bg-green-100 text-green-800' :
                      server.status === 'offline' ? 'bg-red-100 text-red-800' :
                      server.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {server.status || 'unknown'}
                    </span>
                  </div>
                ))}
                {servers.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/servers" className="text-sm text-primary-600 hover:text-primary-500">
                      View {servers.length - 3} more servers →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              System Alerts
            </h3>
          </div>
          <div className="card-body">
            <div className="text-center py-8">
              <p className="text-gray-500">No alerts at this time</p>
              <p className="text-sm text-gray-400 mt-2">
                Your infrastructure is running smoothly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
