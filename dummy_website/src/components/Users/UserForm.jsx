import { useForm } from 'react-hook-form'
import LoadingSpinner from '../UI/LoadingSpinner'

const UserForm = ({ onSubmit, onCancel, isLoading, initialData = null, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: initialData || {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'viewer',
      permissions: [],
      isActive: true,
      password: '',
      confirmPassword: ''
    }
  })

  const watchRole = watch('role')

  const handleFormSubmit = (data) => {
    // Remove password confirmation from data
    const { confirmPassword, ...submitData } = data
    
    // Only include password if it's provided (for edits, empty password means no change)
    if (!isEdit || data.password) {
      submitData.password = data.password
    } else {
      delete submitData.password
    }

    onSubmit(submitData)
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  const rolePermissions = {
    admin: ['system.admin', 'servers.read', 'servers.write', 'servers.delete', 'users.read', 'users.write', 'users.delete', 'network.read', 'network.write', 'monitoring.read', 'automation.read', 'automation.write'],
    operator: ['servers.read', 'servers.write', 'network.read', 'network.write', 'monitoring.read', 'automation.read'],
    viewer: ['servers.read', 'network.read', 'monitoring.read']
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username *
          </label>
          <input
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
              maxLength: { value: 50, message: 'Username cannot exceed 50 characters' },
              pattern: {
                value: /^[a-zA-Z0-9_-]+$/,
                message: 'Username can only contain letters, numbers, underscores, and hyphens'
              }
            })}
            type="text"
            className={`input mt-1 ${errors.username ? 'input-error' : ''}`}
            placeholder="e.g., john_doe"
            disabled={isLoading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            })}
            type="email"
            className={`input mt-1 ${errors.email ? 'input-error' : ''}`}
            placeholder="e.g., john@company.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            {...register('firstName', {
              required: 'First name is required',
              maxLength: { value: 50, message: 'First name cannot exceed 50 characters' }
            })}
            type="text"
            className={`input mt-1 ${errors.firstName ? 'input-error' : ''}`}
            placeholder="e.g., John"
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            {...register('lastName', {
              required: 'Last name is required',
              maxLength: { value: 50, message: 'Last name cannot exceed 50 characters' }
            })}
            type="text"
            className={`input mt-1 ${errors.lastName ? 'input-error' : ''}`}
            placeholder="e.g., Doe"
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Role and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role *
          </label>
          <select
            {...register('role', { required: 'Role is required' })}
            className={`input mt-1 ${errors.role ? 'input-error' : ''}`}
            disabled={isLoading}
          >
            <option value="viewer">Viewer</option>
            <option value="operator">Operator</option>
            <option value="admin">Administrator</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {watchRole === 'admin' && 'Full system access including user management'}
            {watchRole === 'operator' && 'Can manage servers and network, view monitoring'}
            {watchRole === 'viewer' && 'Read-only access to servers, network, and monitoring'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Status
          </label>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                {...register('isActive')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Active Account</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Inactive accounts cannot log in to the system
          </p>
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
          </label>
          <input
            {...register('password', {
              required: !isEdit ? 'Password is required' : false,
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
              }
            })}
            type="password"
            className={`input mt-1 ${errors.password ? 'input-error' : ''}`}
            placeholder={isEdit ? 'Enter new password' : 'Enter password'}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {isEdit ? 'Confirm New Password' : 'Confirm Password *'}
          </label>
          <input
            {...register('confirmPassword', {
              required: !isEdit ? 'Please confirm your password' : false,
              validate: (value, { password }) => {
                if (!isEdit && !value) return 'Please confirm your password'
                if (password && value !== password) return 'Passwords do not match'
                return true
              }
            })}
            type="password"
            className={`input mt-1 ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder={isEdit ? 'Confirm new password' : 'Confirm password'}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Permissions Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Permissions Preview
        </label>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            {rolePermissions[watchRole]?.map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {permission}
              </span>
            ))}
          </div>
          {!rolePermissions[watchRole]?.length && (
            <p className="text-sm text-gray-500">No permissions assigned</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="btn-outline"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update User' : 'Create User'
          )}
        </button>
      </div>
    </form>
  )
}

export default UserForm
