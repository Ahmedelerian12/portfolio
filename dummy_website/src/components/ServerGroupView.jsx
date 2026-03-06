import { useState, useMemo } from 'react'

// Simple chevron icons
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const ServerGroupView = ({ servers, onManage, onEdit, onDelete, onExportToNotepad }) => {
  const [expandedDatacenters, setExpandedDatacenters] = useState({})
  const [expandedSeries, setExpandedSeries] = useState({})

  // Group servers by datacenter and series based on naming convention
  const groupedServers = useMemo(() => {
    const groups = {}

    // Helper function to determine datacenter from server name
    const getDatacenterFromName = (serverName) => {
      const name = serverName.toLowerCase()

      // Handle blade servers
      if (name.startsWith('b')) {
        const bladeMatch = name.match(/^b(\d{2})/)
        if (bladeMatch) {
          const bladeNum = parseInt(bladeMatch[1])
          if (bladeNum >= 1 && bladeNum <= 5) {
            return 'AMS 5'
          } else if (bladeNum >= 6 && bladeNum <= 10) {
            return 'AMS EXA'
          }
        }
        return 'Unknown Blades'
      }

      // Handle regular servers by first digit
      const firstDigit = name.charAt(0)
      switch (firstDigit) {
        case '0':
          return 'Valencia'
        case '2':
          return 'Madrid'
        case '3':
          return 'AMS 5'
        case '4':
          return 'AMS EXA'
        default:
          return 'Other Servers'
      }
    }

    servers.forEach(server => {
      // Use actual datacenter field from database, fallback to name-based detection
      const datacenter = server.datacenter || getDatacenterFromName(server.name)

      if (!groups[datacenter]) {
        groups[datacenter] = {}
      }

      // Extract series from server name
      let series = 'Other'
      const name = server.name.toLowerCase()

      if (name.startsWith('b')) {
        // Blade servers: group by blade range
        const bladeMatch = name.match(/^b(\d{2})/)
        if (bladeMatch) {
          const bladeNum = parseInt(bladeMatch[1])
          if (bladeNum >= 1 && bladeNum <= 5) {
            series = 'Blades b01-b05'
          } else if (bladeNum >= 6 && bladeNum <= 10) {
            series = 'Blades b06-b10'
          } else {
            series = 'Other Blades'
          }
        }
      } else {
        // Regular servers: extract series (e.g., "001-107" -> "001")
        const seriesMatch = server.name.match(/^(\d{3})-/)
        if (seriesMatch) {
          series = seriesMatch[1]
        }
      }

      if (!groups[datacenter][series]) {
        groups[datacenter][series] = []
      }

      groups[datacenter][series].push(server)
    })

    // Sort servers within each series
    Object.keys(groups).forEach(datacenter => {
      Object.keys(groups[datacenter]).forEach(series => {
        groups[datacenter][series].sort((a, b) => a.name.localeCompare(b.name))
      })
    })

    return groups
  }, [servers])

  const toggleDatacenter = (datacenter) => {
    setExpandedDatacenters(prev => ({
      ...prev,
      [datacenter]: !prev[datacenter]
    }))
  }

  const toggleSeries = (datacenter, series) => {
    const key = `${datacenter}-${series}`
    setExpandedSeries(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getSeriesRange = (serversInSeries) => {
    if (serversInSeries.length === 0) return ''
    if (serversInSeries.length === 1) return serversInSeries[0].name

    const names = serversInSeries.map(s => s.name).sort()
    return `${names[0]} to ${names[names.length - 1]}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'offline': return 'text-red-600 bg-red-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDatacenterIcon = (datacenter) => {
    switch (datacenter) {
      case 'Valencia': return '🇪🇸'
      case 'Madrid': return '🏛️'
      case 'AMS 5': return '🇳🇱'
      case 'AMS EXA': return '⚡'
      default: return '🏢'
    }
  }

  const getDatacenterColor = (datacenter) => {
    switch (datacenter) {
      case 'Valencia': return 'bg-orange-50 border-orange-200'
      case 'Madrid': return 'bg-red-50 border-red-200'
      case 'AMS 5': return 'bg-blue-50 border-blue-200'
      case 'AMS EXA': return 'bg-purple-50 border-purple-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getDatacenterTextColor = (datacenter) => {
    switch (datacenter) {
      case 'Valencia': return 'text-orange-900'
      case 'Madrid': return 'text-red-900'
      case 'AMS 5': return 'text-blue-900'
      case 'AMS EXA': return 'text-purple-900'
      default: return 'text-gray-900'
    }
  }

  const getDatacenterBadgeColor = (datacenter) => {
    switch (datacenter) {
      case 'Valencia': return 'bg-orange-100 text-orange-800'
      case 'Madrid': return 'bg-red-100 text-red-800'
      case 'AMS 5': return 'bg-blue-100 text-blue-800'
      case 'AMS EXA': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDatacenterHoverColor = (datacenter) => {
    switch (datacenter) {
      case 'Valencia': return 'hover:bg-orange-100'
      case 'Madrid': return 'hover:bg-red-100'
      case 'AMS 5': return 'hover:bg-blue-100'
      case 'AMS EXA': return 'hover:bg-purple-100'
      default: return 'hover:bg-gray-100'
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedServers).map(([datacenter, seriesGroups]) => {
        const isDatacenterExpanded = expandedDatacenters[datacenter]
        const totalServersInDatacenter = Object.values(seriesGroups).reduce((sum, servers) => sum + servers.length, 0)

        return (
          <div key={datacenter} className="bg-white shadow rounded-lg overflow-hidden">
            {/* Datacenter Header */}
            <div
              className={`${getDatacenterColor(datacenter)} border-b px-6 py-4 cursor-pointer ${getDatacenterHoverColor(datacenter)} transition-colors`}
              onClick={() => toggleDatacenter(datacenter)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDatacenterExpanded ? (
                    <ChevronDownIcon className={`h-5 w-5 ${getDatacenterTextColor(datacenter)}`} />
                  ) : (
                    <ChevronRightIcon className={`h-5 w-5 ${getDatacenterTextColor(datacenter)}`} />
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getDatacenterIcon(datacenter)}</span>
                    <h2 className={`text-xl font-bold ${getDatacenterTextColor(datacenter)}`}>{datacenter}</h2>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDatacenterBadgeColor(datacenter)}`}>
                    {totalServersInDatacenter} servers
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {Object.keys(seriesGroups).length} series
                  </span>
                </div>
              </div>
            </div>

            {/* Series Groups */}
            {isDatacenterExpanded && (
              <div className="divide-y divide-gray-200">
                {Object.entries(seriesGroups).sort().map(([series, serversInSeries]) => {
                  const seriesKey = `${datacenter}-${series}`
                  const isSeriesExpanded = expandedSeries[seriesKey]
                  const range = getSeriesRange(serversInSeries)

                  return (
                    <div key={series}>
                      {/* Series Header */}
                      <div
                        className="bg-gray-50 px-8 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleSeries(datacenter, series)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {isSeriesExpanded ? (
                              <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                            )}
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{series.startsWith('Blades') ? '🔧' : '📊'}</span>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {series === 'Other' ? 'Other Servers' :
                                  series.startsWith('Blades') ? series :
                                    `${series}-xxx Series`}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">
                              {serversInSeries.length} servers ({range})
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                              {serversInSeries.filter(s => s.status === 'online').length} online
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Servers in Series */}
                      {isSeriesExpanded && (
                        <div className="bg-white">
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                            {serversInSeries.map((server) => (
                              <ServerCard
                                key={server._id || server.id}
                                server={server}
                                onManage={onManage}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onExportToNotepad={onExportToNotepad}
                                compact={true}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Compact Server Card for grouped view
const ServerCard = ({ server, onManage, onEdit, onDelete, onExportToNotepad, compact = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'offline': return 'text-red-600 bg-red-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPowerStateColor = (powerState) => {
    switch (powerState) {
      case 'On': return 'text-green-600'
      case 'Off': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Check if server has password configured
  const hasPassword = server.managementInterface?.password &&
    server.managementInterface.password.trim() !== ''

  // Get card background color based on password status
  const getCardBackgroundColor = () => {
    if (!hasPassword) {
      return 'bg-yellow-50 border-yellow-200' // Yellow background for missing password
    }
    return 'bg-gray-50 border-gray-200' // Normal background
  }

  if (compact) {
    return (
      <div className={`rounded-lg p-4 hover:shadow-md transition-shadow border ${getCardBackgroundColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🖥️</span>
            <h4 className="font-medium text-gray-900">{server.name}</h4>
            {!hasPassword && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠️
              </span>
            )}
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
            {server.status}
          </span>
        </div>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <div>
            <div>IP: {server.ipAddress || server.ip}</div>
            {server.additionalIPs && server.additionalIPs.length > 0 && (
              <div className="text-xs text-blue-600 ml-4 mt-1">
                {server.additionalIPs.slice(0, 3).map((ip, index) => (
                  <div key={index}>+ {ip}</div>
                ))}
                {server.additionalIPs.length > 3 && (
                  <div className="text-gray-500">+ {server.additionalIPs.length - 3} more IPs</div>
                )}
              </div>
            )}
          </div>
          {server.managementInterface?.ip && (
            <div>
              <div>iLO: {server.managementInterface.ip}</div>
              {server.managementInterface?.additionalIPs && server.managementInterface.additionalIPs.length > 0 && (
                <div className="text-xs text-green-600 ml-4 mt-1">
                  {server.managementInterface.additionalIPs.slice(0, 3).map((ip, index) => (
                    <div key={index}>+ {ip}</div>
                  ))}
                  {server.managementInterface.additionalIPs.length > 3 && (
                    <div className="text-gray-500">+ {server.managementInterface.additionalIPs.length - 3} more iLO IPs</div>
                  )}
                </div>
              )}
            </div>
          )}
          <div>Model: {server.model || 'Unknown'}</div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(server)}
            className="flex-1 text-xs bg-white py-1 px-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          {server.managementInterface?.enabled && (
            <button
              onClick={() => onManage(server)}
              className="flex-1 text-xs bg-blue-600 py-1 px-2 border border-transparent rounded text-white hover:bg-blue-700"
            >
              Manage
            </button>
          )}
          <button
            onClick={() => onExportToNotepad(server._id || server.id)}
            className="text-xs bg-purple-600 py-1 px-2 border border-transparent rounded text-white hover:bg-purple-700"
          >
            📄
          </button>
        </div>
      </div>
    )
  }

  // Full server card (existing implementation)
  return (
    <div className={`overflow-hidden shadow rounded-lg border ${!hasPassword ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🖥️</span>
            </div>
            <div className="ml-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">{server.name}</h3>
                {!hasPassword && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠️ No Password
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{server.model}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
              {server.status}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">IP Address</dt>
              <dd className="text-sm text-gray-900">{server.ipAddress || server.ip}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Vendor</dt>
              <dd className="text-sm text-gray-900">{server.vendor}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Power State</dt>
              <dd className={`text-sm font-medium ${getPowerStateColor(server.powerState)}`}>
                {server.powerState}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Management</dt>
              <dd className="text-sm text-gray-900">
                {server.managementInterface?.enabled ? (
                  <span className="text-green-600">
                    {server.managementInterface.type} ({server.managementInterface.ip})
                  </span>
                ) : (
                  <span className="text-gray-400">Not configured</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => onEdit(server)}
            className="flex-1 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          {server.managementInterface?.enabled && (
            <button
              onClick={() => onManage(server)}
              className="flex-1 bg-blue-600 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white hover:bg-blue-700"
            >
              Manage
            </button>
          )}
          <button
            onClick={() => onExportToNotepad(server._id || server.id)}
            className="bg-purple-600 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white hover:bg-purple-700"
          >
            📄
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServerGroupView
