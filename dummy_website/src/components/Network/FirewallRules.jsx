import { PlusIcon, ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'

const FirewallRules = () => {
  const rules = [
    {
      id: 1,
      name: 'Allow HTTP',
      action: 'allow',
      protocol: 'TCP',
      source: 'any',
      destination: '192.168.1.0/24',
      port: '80',
      enabled: true
    },
    {
      id: 2,
      name: 'Allow HTTPS',
      action: 'allow',
      protocol: 'TCP',
      source: 'any',
      destination: '192.168.1.0/24',
      port: '443',
      enabled: true
    },
    {
      id: 3,
      name: 'Block SSH from Internet',
      action: 'deny',
      protocol: 'TCP',
      source: '0.0.0.0/0',
      destination: '192.168.1.0/24',
      port: '22',
      enabled: true
    },
    {
      id: 4,
      name: 'Allow Internal SSH',
      action: 'allow',
      protocol: 'TCP',
      source: '192.168.1.0/24',
      destination: '192.168.1.0/24',
      port: '22',
      enabled: false
    }
  ]

  const getActionColor = (action) => {
    return action === 'allow' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getActionIcon = (action) => {
    return action === 'allow' 
      ? <ShieldCheckIcon className="h-4 w-4" />
      : <ShieldExclamationIcon className="h-4 w-4" />
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Firewall Rules</h2>
          <p className="text-sm text-gray-600">Manage network access control rules</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Port
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rule.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(rule.action)}`}>
                        {getActionIcon(rule.action)}
                        <span className="ml-1 capitalize">{rule.action}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.protocol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.port}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
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
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-green-600">
                {rules.filter(rule => rule.action === 'allow' && rule.enabled).length}
              </div>
              <div className="text-sm text-green-600">Allow Rules</div>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-red-600">
                {rules.filter(rule => rule.action === 'deny' && rule.enabled).length}
              </div>
              <div className="text-sm text-red-600">Deny Rules</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">
                {rules.filter(rule => !rule.enabled).length}
              </span>
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-600">
                {rules.filter(rule => !rule.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Disabled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirewallRules
