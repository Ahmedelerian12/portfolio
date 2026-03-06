import { 
  UserIcon, 
  PencilIcon, 
  TrashIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

const UserCard = ({ user, currentUser, onEdit, onDelete, isDeleting }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'operator':
        return 'bg-blue-100 text-blue-800'
      case 'viewer':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldExclamationIcon className="h-5 w-5" />
      case 'operator':
        return <ShieldCheckIcon className="h-5 w-5" />
      case 'viewer':
        return <UserIcon className="h-5 w-5" />
      default:
        return <UserIcon className="h-5 w-5" />
    }
  }

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100'
  }

  const isCurrentUser = user._id === currentUser.id || user.id === currentUser.id

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
                {isCurrentUser && (
                  <span className="ml-2 text-sm text-primary-600">(You)</span>
                )}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                @{user.username}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* User Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Email:</span>
            <span className="text-gray-900 truncate ml-2" title={user.email}>
              {user.email}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Role:</span>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                <span className="mr-1">
                  {getRoleIcon(user.role)}
                </span>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>

          {user.lastLogin && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Last Login:</span>
              <span className="text-gray-900">
                {new Date(user.lastLogin).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Created:</span>
            <span className="text-gray-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Permissions Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
          <div className="flex flex-wrap gap-1">
            {user.permissions?.slice(0, 3).map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                {permission}
              </span>
            ))}
            {user.permissions?.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                +{user.permissions.length - 3} more
              </span>
            )}
            {!user.permissions?.length && (
              <span className="text-xs text-gray-500">No permissions assigned</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {user.role === 'admin' && (
              <span className="flex items-center">
                <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                Administrator
              </span>
            )}
            {user.role === 'operator' && (
              <span className="flex items-center">
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                Operator
              </span>
            )}
            {user.role === 'viewer' && (
              <span className="flex items-center">
                <UserIcon className="h-3 w-3 mr-1" />
                Viewer
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PencilIcon className="h-3 w-3 mr-1" />
              Edit
            </button>
            
            {!isCurrentUser && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="h-3 w-3 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserCard
