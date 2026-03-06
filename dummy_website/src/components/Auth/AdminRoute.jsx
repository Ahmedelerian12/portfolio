import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  const { user, loading, hasRole } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🖥️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">IstqSERVERS</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has admin role
  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This section is restricted to administrators only.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-400 text-xl mr-3">⚠️</div>
              <div className="text-left">
                <p className="text-sm font-medium text-red-800">Required Access Level</p>
                <p className="text-sm text-red-600">Administrator</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-blue-400 text-xl mr-3">👤</div>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800">Your Current Role</p>
                <p className="text-sm text-blue-600 capitalize">{user?.role || 'Unknown'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Go Back
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Contact your system administrator if you believe you should have access to this page.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute
