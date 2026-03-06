import { useForm } from 'react-hook-form'
import LoadingSpinner from '../UI/LoadingSpinner'

const ServerForm = ({ onSubmit, onCancel, isLoading, initialData = null }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: initialData || {
      name: '',
      ipAddress: '',
      type: 'physical',
      environment: 'production',
      description: '',
      hostname: '',
      os: {
        name: '',
        version: '',
        architecture: ''
      },
      location: {
        datacenter: '',
        rack: '',
        position: ''
      },
      vendor: '',
      managementInterface: {
        type: '',
        ip: '',
        port: 443,
        username: '',
        password: '',
        enabled: false
      }
    }
  })

  const handleFormSubmit = (data) => {
    onSubmit(data)
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Server Name *
          </label>
          <input
            {...register('name', {
              required: 'Server name is required',
              maxLength: { value: 100, message: 'Name cannot exceed 100 characters' }
            })}
            type="text"
            className={`input mt-1 ${errors.name ? 'input-error' : ''}`}
            placeholder="e.g., web-server-01"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700">
            IP Address *
          </label>
          <input
            {...register('ipAddress', {
              required: 'IP address is required',
              pattern: {
                value: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                message: 'Please enter a valid IP address'
              }
            })}
            type="text"
            className={`input mt-1 ${errors.ipAddress ? 'input-error' : ''}`}
            placeholder="e.g., 192.168.1.100"
            disabled={isLoading}
          />
          {errors.ipAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.ipAddress.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="hostname" className="block text-sm font-medium text-gray-700">
            Hostname
          </label>
          <input
            {...register('hostname')}
            type="text"
            className="input mt-1"
            placeholder="e.g., web01.company.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Server Type *
          </label>
          <select
            {...register('type', { required: 'Server type is required' })}
            className={`input mt-1 ${errors.type ? 'input-error' : ''}`}
            disabled={isLoading}
          >
            <option value="physical">Physical Server</option>
            <option value="virtual">Virtual Machine</option>
            <option value="container">Container</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="environment" className="block text-sm font-medium text-gray-700">
            Environment
          </label>
          <select
            {...register('environment')}
            className="input mt-1"
            disabled={isLoading}
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
            <option value="testing">Testing</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description', {
            maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
          })}
          rows={3}
          className={`input mt-1 ${errors.description ? 'input-error' : ''}`}
          placeholder="Brief description of the server's purpose..."
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Operating System */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Operating System</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="os.name" className="block text-sm font-medium text-gray-700">
              OS Name
            </label>
            <input
              {...register('os.name')}
              type="text"
              className="input mt-1"
              placeholder="e.g., Ubuntu, Windows Server"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="os.version" className="block text-sm font-medium text-gray-700">
              Version
            </label>
            <input
              {...register('os.version')}
              type="text"
              className="input mt-1"
              placeholder="e.g., 22.04, 2022"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="os.architecture" className="block text-sm font-medium text-gray-700">
              Architecture
            </label>
            <select
              {...register('os.architecture')}
              className="input mt-1"
              disabled={isLoading}
            >
              <option value="">Select architecture</option>
              <option value="x64">x64</option>
              <option value="x86">x86</option>
              <option value="arm64">ARM64</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendor Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Vendor Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
              Vendor
            </label>
            <select
              {...register('vendor')}
              className="input mt-1"
              disabled={isLoading}
            >
              <option value="">Select vendor</option>
              <option value="HP">HP</option>
              <option value="HPE">HPE</option>
              <option value="Dell">Dell</option>
              <option value="Dell Inc.">Dell Inc.</option>
              <option value="Lenovo">Lenovo</option>
              <option value="IBM">IBM</option>
              <option value="Cisco">Cisco</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Management Interface */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Management Interface (iLO/iDRAC)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="managementInterface.type" className="block text-sm font-medium text-gray-700">
              Management Type
            </label>
            <select
              {...register('managementInterface.type')}
              className="input mt-1"
              disabled={isLoading}
            >
              <option value="">Select type</option>
              <option value="iLO">HP iLO</option>
              <option value="iDRAC">Dell iDRAC</option>
              <option value="IPMI">IPMI</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="managementInterface.ip" className="block text-sm font-medium text-gray-700">
              Management IP Address
            </label>
            <input
              {...register('managementInterface.ip', {
                pattern: {
                  value: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                  message: 'Please enter a valid IP address'
                }
              })}
              type="text"
              className={`input mt-1 ${errors.managementInterface?.ip ? 'input-error' : ''}`}
              placeholder="e.g., 192.168.1.50"
              disabled={isLoading}
            />
            {errors.managementInterface?.ip && (
              <p className="mt-1 text-sm text-red-600">{errors.managementInterface.ip.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="managementInterface.username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              {...register('managementInterface.username')}
              type="text"
              className="input mt-1"
              placeholder="e.g., admin"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="managementInterface.password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register('managementInterface.password')}
              type="password"
              className="input mt-1"
              placeholder="Management interface password"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="managementInterface.port" className="block text-sm font-medium text-gray-700">
              Port
            </label>
            <input
              {...register('managementInterface.port', {
                valueAsNumber: true,
                min: { value: 1, message: 'Port must be between 1 and 65535' },
                max: { value: 65535, message: 'Port must be between 1 and 65535' }
              })}
              type="number"
              className={`input mt-1 ${errors.managementInterface?.port ? 'input-error' : ''}`}
              placeholder="443"
              disabled={isLoading}
            />
            {errors.managementInterface?.port && (
              <p className="mt-1 text-sm text-red-600">{errors.managementInterface.port.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                {...register('managementInterface.enabled')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Enable Management Interface</span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Management Interface Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Configure the out-of-band management interface (iLO for HP servers, iDRAC for Dell servers) to enable remote server management capabilities including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Power control (on/off/restart)</li>
                  <li>Hardware monitoring (temperature, fans, power)</li>
                  <li>System information and logs</li>
                  <li>Network interface status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Location</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="location.datacenter" className="block text-sm font-medium text-gray-700">
              Datacenter
            </label>
            <input
              {...register('location.datacenter')}
              type="text"
              className="input mt-1"
              placeholder="e.g., DC-East-01"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="location.rack" className="block text-sm font-medium text-gray-700">
              Rack
            </label>
            <input
              {...register('location.rack')}
              type="text"
              className="input mt-1"
              placeholder="e.g., R-42"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="location.position" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              {...register('location.position')}
              type="text"
              className="input mt-1"
              placeholder="e.g., U1-U4"
              disabled={isLoading}
            />
          </div>
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
              {initialData ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            initialData ? 'Update Server' : 'Add Server'
          )}
        </button>
      </div>
    </form>
  )
}

export default ServerForm
