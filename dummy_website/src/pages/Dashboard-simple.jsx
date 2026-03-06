import React from 'react'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">🖥️</span>
              <h1 className="text-2xl font-bold text-gray-900">IstqSERVERS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || user?.username}!
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Welcome Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-4xl">👋</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Welcome!</h3>
                    <p className="text-sm text-gray-600">
                      You're successfully logged into IstqSERVERS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-4xl">👤</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">User Info</h3>
                    <p className="text-sm text-gray-600">
                      Role: {user?.role || 'User'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Username: {user?.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-4xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">System Status</h3>
                    <p className="text-sm text-gray-600">
                      All systems operational
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Features Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  🖥️ IstqSERVERS Features
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🖥️</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Server Management</h3>
                      <p className="text-sm text-gray-600">
                        Manage HP iLO and Dell iDRAC servers remotely
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Power Control</h3>
                      <p className="text-sm text-gray-600">
                        Remote power on/off, restart, and graceful shutdown
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🌡️</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Hardware Monitoring</h3>
                      <p className="text-sm text-gray-600">
                        Temperature, fan speeds, and power consumption
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Network Management</h3>
                      <p className="text-sm text-gray-600">
                        IP management, VLANs, and firewall configuration
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Real-time Monitoring</h3>
                      <p className="text-sm text-gray-600">
                        Live server metrics and health status
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <h3 className="font-medium text-gray-900">User Management</h3>
                      <p className="text-sm text-gray-600">
                        Role-based access control and permissions
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Login Success Info */}
          <div className="mt-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400 text-2xl">✅</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">
                    Login Successful!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>You have successfully logged into IstqSERVERS.</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Role:</strong> Administrator</li>
                      <li><strong>Permissions:</strong> Full access to all features</li>
                      <li><strong>Session:</strong> Active and secure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Dashboard
