import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminRoute from '../Auth/AdminRoute'

const DashboardWrapper = ({ children }) => {
  const location = useLocation()
  const { hasRole } = useAuth()

  // Define admin-only routes
  const adminOnlyRoutes = [
    '/onedrive-sync',
    '/users'
  ]

  // Check if current route requires admin access
  const requiresAdmin = adminOnlyRoutes.some(route => 
    location.pathname.startsWith(route)
  )

  // If route requires admin access, wrap with AdminRoute
  if (requiresAdmin) {
    return (
      <AdminRoute>
        {children}
      </AdminRoute>
    )
  }

  // For non-admin routes, render normally
  return children
}

export default DashboardWrapper
