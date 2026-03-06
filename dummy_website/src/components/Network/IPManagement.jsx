import { useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const IPManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Mock data for demonstration
  const [ipAddresses] = useState([
    {
      id: 1,
      ip: '192.168.1.10',
      hostname: 'web-server-01',
      status: 'assigned',
      type: 'static',
      subnet: '192.168.1.0/24',
      description: 'Main web server'
    },
    {
      id: 2,
      ip: '192.168.1.20',
      hostname: 'db-server-01',
      status: 'assigned',
      type: 'static',
      subnet: '192.168.1.0/24',
      description: 'Database server'
    },
    {
      id: 3,
      ip: '192.168.1.100',
      hostname: '',
      status: 'available',
      type: 'dynamic',
      subnet: '192.168.1.0/24',
      description: 'Available for DHCP'
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-green-100 text-green-800'
      case 'available':
        return 'bg-blue-100 text-blue-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'conflict':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredIPs = ipAddresses.filter(ip =>
    ip.ip.includes(searchTerm) ||
    ip.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ip.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">IP Address Management</h2>
          <p className="text-sm text-gray-600">Manage and track IP address assignments</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add IP Address
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search IP addresses, hostnames, or descriptions..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Add IP Form */}
      {showAddForm && (
        <div className="mb-6 card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Add New IP Address</h3>
          </div>
          <div className="card-body">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <input type="text" className="input mt-1" placeholder="192.168.1.10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hostname</label>
                <input type="text" className="input mt-1" placeholder="web-server-01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subnet</label>
                <select className="input mt-1">
                  <option>192.168.1.0/24</option>
                  <option>192.168.2.0/24</option>
                  <option>10.0.0.0/8</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select className="input mt-1">
                  <option>Static</option>
                  <option>Dynamic</option>
                  <option>Reserved</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" className="input mt-1" placeholder="Description of the IP assignment" />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add IP Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IP Address Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hostname
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subnet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIPs.map((ip) => (
                  <tr key={ip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ip.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ip.hostname || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ip.status)}`}>
                        {ip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {ip.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ip.subnet}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ip.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredIPs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No IP addresses found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {ipAddresses.filter(ip => ip.status === 'assigned').length}
          </div>
          <div className="text-sm text-green-600">Assigned</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {ipAddresses.filter(ip => ip.status === 'available').length}
          </div>
          <div className="text-sm text-blue-600">Available</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {ipAddresses.filter(ip => ip.status === 'reserved').length}
          </div>
          <div className="text-sm text-yellow-600">Reserved</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {ipAddresses.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>
    </div>
  )
}

export default IPManagement
