import { PlusIcon } from '@heroicons/react/24/outline'

const SubnetManagement = () => {
  const subnets = [
    {
      id: 1,
      network: '192.168.1.0/24',
      name: 'Main LAN',
      gateway: '192.168.1.1',
      dns: '8.8.8.8, 8.8.4.4',
      vlan: 'VLAN 10',
      description: 'Primary network for servers and workstations'
    },
    {
      id: 2,
      network: '192.168.2.0/24',
      name: 'DMZ',
      gateway: '192.168.2.1',
      dns: '8.8.8.8',
      vlan: 'VLAN 20',
      description: 'Demilitarized zone for public services'
    }
  ]

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Subnet Management</h2>
          <p className="text-sm text-gray-600">Configure and manage network subnets</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Subnet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subnets.map((subnet) => (
          <div key={subnet.id} className="card">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{subnet.name}</h3>
                  <p className="text-sm text-gray-500">{subnet.network}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Gateway:</dt>
                  <dd className="text-gray-900">{subnet.gateway}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">DNS:</dt>
                  <dd className="text-gray-900">{subnet.dns}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">VLAN:</dt>
                  <dd className="text-gray-900">{subnet.vlan}</dd>
                </div>
              </dl>
              
              <p className="text-sm text-gray-600 mt-3">{subnet.description}</p>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button className="text-primary-600 hover:text-primary-900 text-sm">
                  Edit
                </button>
                <button className="text-red-600 hover:text-red-900 text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubnetManagement
