import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { usersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import UserForm from '../../components/Users/UserForm'
import UserCard from '../../components/Users/UserCard'
import { PlusIcon } from '@heroicons/react/24/outline'

const Users = () => {
  const { user: currentUser } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const queryClient = useQueryClient()

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery(
    'users',
    () => usersAPI.getAll(),
    {
      select: (response) => response.data
    }
  )

  // Add user mutation
  const addUserMutation = useMutation(
    (userData) => usersAPI.create(userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
        setShowAddForm(false)
        toast.success('User created successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create user')
      }
    }
  )

  // Update user mutation
  const updateUserMutation = useMutation(
    ({ id, userData }) => usersAPI.update(id, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
        setEditingUser(null)
        toast.success('User updated successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user')
      }
    }
  )

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (userId) => usersAPI.delete(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
        toast.success('User deleted successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user')
      }
    }
  )

  const handleAddUser = (userData) => {
    addUserMutation.mutate(userData)
  }

  const handleUpdateUser = (userData) => {
    updateUserMutation.mutate({ id: editingUser._id, userData })
  }

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) {
      toast.error('You cannot delete your own account')
      return
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Error loading users
        </h3>
        <p className="text-gray-500">
          {error.response?.data?.message || 'Something went wrong'}
        </p>
      </div>
    )
  }

  const users = usersData?.users || []

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
          disabled={addUserMutation.isLoading}
        >
          {addUserMutation.isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add User
            </>
          )}
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
            </div>
            <div className="card-body">
              <UserForm
                onSubmit={handleAddUser}
                onCancel={() => setShowAddForm(false)}
                isLoading={addUserMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
            </div>
            <div className="card-body">
              <UserForm
                initialData={editingUser}
                onSubmit={handleUpdateUser}
                onCancel={() => setEditingUser(null)}
                isLoading={updateUserMutation.isLoading}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      {users.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first user to the system.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First User
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              currentUser={currentUser}
              onEdit={() => setEditingUser(user)}
              onDelete={() => handleDeleteUser(user._id)}
              isDeleting={deleteUserMutation.isLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Users
