import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts'
import ServerImport from './components/ServerImport'
import ExcelImport from './components/ExcelImport'
import ServerGroupView from './components/ServerGroupView'
import IloTestingPage from './components/IloTesting/IloTestingPage'
import { API_ENDPOINTS, apiCall } from './config/api'
import RackElevation from './components/Datacenter/RackView'
import OrderManagement from './pages/orders/OrderManagement'
import { useAuth } from './context/AuthContext'
import Header from './components/Layout/Header'
import Sidebar, { navigation } from './components/Layout/Sidebar'


// Mock server data
const mockServers = [
  {
    id: 1,
    name: 'HP-Server-01',
    ip: '192.168.1.10',
    vendor: 'HP',
    model: 'ProLiant DL380 Gen10',
    status: 'online',
    powerState: 'On',
    managementInterface: {
      type: 'iLO',
      ip: '192.168.1.100',
      enabled: true
    },
    location: {
      datacenter: 'DC-East-01',
      rack: 'R-42',
      position: 'U1-U4'
    }
  },
  {
    id: 2,
    name: 'Dell-Server-01',
    ip: '192.168.1.11',
    vendor: 'Dell',
    model: 'PowerEdge R740',
    status: 'online',
    powerState: 'On',
    managementInterface: {
      type: 'iDRAC',
      ip: '192.168.1.101',
      enabled: true
    },
    location: {
      datacenter: 'DC-East-01',
      rack: 'R-43',
      position: 'U1-U2'
    }
  },
  {
    id: 3,
    name: 'HP-Server-02',
    ip: '192.168.1.12',
    vendor: 'HPE',
    model: 'ProLiant DL360 Gen10',
    status: 'offline',
    powerState: 'Off',
    managementInterface: {
      type: 'iLO',
      ip: '192.168.1.102',
      enabled: false
    },
    location: {
      datacenter: 'DC-West-01',
      rack: 'R-10',
      position: 'U5-U6'
    }
  }
]

// Server Management Components
const ServerCard = ({ server, onManage, onEdit, onDelete, onExportToNotepad }) => {
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

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🖥️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{server.name}</h3>
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
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    🏢 {server.location?.datacenter || server.datacenter}
                  </span>
                  {server.location?.rack && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      🗄️ Rack {server.location.rack}
                    </span>
                  )}
                  {server.location?.position && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      📍 Unit {server.location.position}
                    </span>
                  )}
                </div>
              </dd>
            </div>
            {server.datacenter && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Datacenter</dt>
                <dd className="text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🏢 {server.datacenter}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => onEdit(server)}
            className="flex-1 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </button>

          {server.managementInterface?.enabled && (
            <button
              onClick={() => onManage(server)}
              className="flex-1 bg-blue-600 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage
            </button>
          )}

          <button
            onClick={() => onExportToNotepad(server._id || server.id)}
            className="bg-purple-600 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            title="Export to Notepad"
          >
            📄
          </button>

          <button
            onClick={() => onDelete(server)}
            className="bg-red-600 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Network Analysis Page Component
const NetworkAnalysisPage = ({ refreshKey }) => {
  const { hasPermission } = useAuth()
  const [subnets, setSubnets] = useState([])
  const [summary, setSummary] = useState(null)
  const [duplicates, setDuplicates] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSubnet, setSelectedSubnet] = useState(null)
  const [filterSwitch, setFilterSwitch] = useState('')
  const [activeTab, setActiveTab] = useState('subnets') // 'subnets', 'duplicates', 'subnet-detail', 'ilo-racks', 'ilo-testing', 'switch-search', 'visual-racks'
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'list'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDatacenter, setFilterDatacenter] = useState('')
  const [selectedSubnetDetail, setSelectedSubnetDetail] = useState(null)
  const [availableIPs, setAvailableIPs] = useState(null)
  const [loadingAvailableIPs, setLoadingAvailableIPs] = useState(false)
  const [iloRackData, setIloRackData] = useState([])
  const [loadingIloRacks, setLoadingIloRacks] = useState(false)
  const [switchData, setSwitchData] = useState([])
  const [loadingSwitches, setLoadingSwitches] = useState(false)
  const [expandedRacks, setExpandedRacks] = useState(new Set())

  const isServerMatchingSwitch = (server) => {
    if (!filterSwitch) return false

    // Normalize both strings by converting to lowercase and replacing multiple spaces with a single space
    const normalize = (str) => {
      if (!str) return ''
      return str.toLowerCase().replace(/\s+/g, ' ').trim()
    }

    const switchLower = normalize(filterSwitch)

    // Check various possible locations for switch information
    return (
      normalize(server.networkInfo?.serverNetworkDescription).includes(switchLower) ||
      normalize(server.networkInfo?.iloNetworkDescription).includes(switchLower) ||
      normalize(server.networkPort).includes(switchLower) ||
      normalize(server.iloPort).includes(switchLower) ||
      normalize(server.networkConnection).includes(switchLower) ||
      normalize(server.managementInterface?.networkConnection).includes(switchLower)
    )
  }

  // Load subnet analysis
  useEffect(() => {
    loadSubnetAnalysis()
  }, [refreshKey])

  // Load iLO rack data when tab is selected
  useEffect(() => {
    if (activeTab === 'ilo-racks' || activeTab === 'switch-search' || activeTab === 'visual-racks') {
      loadIloRackData()
    }
    if (activeTab === 'switches') {
      loadSwitchData()
    }
  }, [activeTab])

  const loadSubnetAnalysis = async () => {
    try {
      if (subnets.length === 0) {
        setLoading(true)
      }
      console.log('🌐 Loading subnet analysis...')

      const response = await apiCall(`${API_ENDPOINTS.NETWORK.BASE}/subnets`)

      if (response && response.ok) {
        const data = await response.json()
        console.log(`✅ Loaded ${data.subnets?.length || 0} subnets`)
        setSubnets(data.subnets || [])
        setSummary(data.summary || {})

        // Extract duplicate IP information
        const duplicateIPs = extractDuplicateIPs(data.subnets || [])
        setDuplicates(duplicateIPs)
        console.log(`🔍 Found ${duplicateIPs.length} duplicate IP conflicts`)
      } else {
        console.error('❌ Failed to load subnet analysis')
        alert('Failed to load subnet analysis')
      }
    } catch (error) {
      console.error('❌ Error loading subnet analysis:', error)
      alert(`Error loading subnet analysis: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadIloRackData = async () => {
    try {
      if (iloRackData.length === 0) {
        setLoadingIloRacks(true)
      }
      console.log('🔧 Loading iLO rack data...')

      const response = await apiCall(`${API_ENDPOINTS.SERVERS.BASE}?limit=10000`)

      if (response && response.ok) {
        const data = await response.json()
        const servers = data.servers || []

        // Debug: Check first few servers' networkInfo structure
        if (servers.length > 0) {
          console.log('🔍 Sample server data structures:')
          servers.slice(0, 3).forEach((server, index) => {
            console.log(`   Server ${index + 1} (${server.name}):`, {
              networkInfo: server.networkInfo,
              hasNetworkInfo: !!server.networkInfo,
              serverNetworkDescription: server.networkInfo?.serverNetworkDescription,
              iloNetworkDescription: server.networkInfo?.iloNetworkDescription,
              networkConnection: server.networkConnection,
              managementInterface: server.managementInterface
            })
          })
        }

        // Process servers to extract iLO and rack information
        // Create comprehensive mapping with different categories
        const processedServers = servers.map(server => ({
          serverName: server.name,
          iloIP: server.managementInterface?.ip || server.management?.ipAddress || null,
          datacenter: server.datacenter || server.location?.datacenter || 'Unknown',
          rack: server.location?.rack || null,
          position: server.location?.position || null,
          model: server.model || 'Unknown',
          status: server.status || 'unknown',
          vendor: server.vendor || 'Unknown',
          networkIP: server.ipAddress || server.ip,
          additionalIPs: server.additionalIPs || [],
          // Extract port information from networkInfo with multiple fallbacks
          networkPort: server.networkInfo?.serverNetworkDescription ||
            server.networkConnection ||
            server.network?.switch_port ||
            null,
          iloPort: server.networkInfo?.iloNetworkDescription ||
            server.managementInterface?.networkConnection ||
            server.ilo?.switch_port ||
            null,
          // Preserve raw network info for filtering
          networkInfo: server.networkInfo || {},
          // Calculate subnet for iLO IP
          iloSubnet: (server.managementInterface?.ip || server.management?.ipAddress) ?
            (server.managementInterface?.ip || server.management?.ipAddress).split('.').slice(0, 3).join('.') + '.0/24' : null,
          // Categorize servers
          category: (() => {
            const hasILO = !!(server.managementInterface?.ip || server.management?.ipAddress)
            const hasRack = !!(server.location?.rack && server.location?.position)

            if (hasILO && hasRack) return 'complete'
            if (hasILO && !hasRack) return 'ilo-only'
            if (!hasILO && hasRack) return 'rack-only'
            return 'incomplete'
          })()
        }))

        // Sort by category first, then by location
        const sortedServers = processedServers.sort((a, b) => {
          // Priority order: complete, ilo-only, rack-only, incomplete
          const categoryOrder = { complete: 0, 'ilo-only': 1, 'rack-only': 2, incomplete: 3 }
          if (categoryOrder[a.category] !== categoryOrder[b.category]) {
            return categoryOrder[a.category] - categoryOrder[b.category]
          }

          // Within same category, sort by datacenter, rack, position
          if (a.datacenter !== b.datacenter) return a.datacenter.localeCompare(b.datacenter)
          if (a.rack && b.rack && a.rack !== b.rack) return a.rack.localeCompare(b.rack)
          if (a.position && b.position) return parseInt(a.position) - parseInt(b.position)
          return a.serverName.localeCompare(b.serverName)
        })

        console.log(`✅ Loaded ${sortedServers.length} total servers:`)
        console.log(`   - ${sortedServers.filter(s => s.category === 'complete').length} with both iLO and rack data`)
        console.log(`   - ${sortedServers.filter(s => s.category === 'ilo-only').length} with iLO only`)
        console.log(`   - ${sortedServers.filter(s => s.category === 'rack-only').length} with rack only`)
        console.log(`   - ${sortedServers.filter(s => s.category === 'incomplete').length} with neither`)

        // Debug port information
        const serversWithNetworkPort = sortedServers.filter(s => s.networkPort)
        const serversWithIloPort = sortedServers.filter(s => s.iloPort)
        console.log(`🔌 Port Information:`)
        console.log(`   - ${serversWithNetworkPort.length} servers with network port info`)
        console.log(`   - ${serversWithIloPort.length} servers with iLO port info`)

        if (serversWithNetworkPort.length > 0) {
          console.log(`📡 Sample network port:`, serversWithNetworkPort[0].networkPort)
        }
        if (serversWithIloPort.length > 0) {
          console.log(`🔧 Sample iLO port:`, serversWithIloPort[0].iloPort)
        }

        setIloRackData(sortedServers)
      } else {
        console.error('❌ Failed to load iLO rack data')
        alert('Failed to load iLO rack data')
      }
    } catch (error) {
      console.error('❌ Error loading iLO rack data:', error)
      alert(`Error loading iLO rack data: ${error.message}`)
    } finally {
      setLoadingIloRacks(false)
    }
  }

  const loadSwitchData = async () => {
    try {
      if (switchData.length === 0) {
        setLoadingSwitches(true)
      }
      console.log('🔌 Loading switch data...')

      const response = await apiCall(API_ENDPOINTS.NETWORK.SWITCHES)

      if (response && response.ok) {
        const data = await response.json()
        console.log(`✅ Loaded ${data.count || 0} unique switches`)
        setSwitchData(data.switches || [])
      } else {
        console.error('❌ Failed to load switch data')
      }
    } catch (error) {
      console.error('❌ Error loading switch data:', error)
    } finally {
      setLoadingSwitches(false)
    }
  }

  // Toggle rack expansion
  const toggleRackExpansion = (rackId) => {
    setExpandedRacks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rackId)) {
        newSet.delete(rackId)
      } else {
        newSet.add(rackId)
      }
      return newSet
    })
  }

  // Extract duplicate IP information from subnets
  const extractDuplicateIPs = (subnets) => {
    const ipMap = {}
    const duplicates = []

    // Collect all IPs and their server associations
    subnets.forEach(subnet => {
      subnet.servers.forEach(server => {
        server.ips.forEach(ipInfo => {
          const ip = ipInfo.ip
          if (!ipMap[ip]) {
            ipMap[ip] = []
          }
          ipMap[ip].push({
            serverName: server.name,
            datacenter: server.datacenter,
            ipType: ipInfo.type,
            subnet: subnet.subnet,
            networkInfo: server.networkInfo || {}
          })
        })
      })
    })

    // Find IPs that appear more than once
    Object.entries(ipMap).forEach(([ip, servers]) => {
      if (servers.length > 1) {
        duplicates.push({
          ip,
          count: servers.length,
          servers,
          datacenters: [...new Set(servers.map(s => s.datacenter))],
          ipTypes: [...new Set(servers.map(s => s.ipType))],
          subnets: [...new Set(servers.map(s => s.subnet))]
        })
      }
    })

    // Sort by count (most duplicated first)
    return duplicates.sort((a, b) => b.count - a.count)
  }

  // Filter subnets based on search and datacenter filter
  const filteredSubnets = subnets.filter(subnet => {
    const normalize = (str) => (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const searchLower = normalize(searchTerm);

    const matchesSearch = !searchTerm ||
      normalize(subnet.subnet).includes(searchLower) ||
      normalize(subnet.primaryDatacenter).includes(searchLower) ||
      Object.keys(subnet.datacenters).some(dc => normalize(dc).includes(searchLower)) ||
      subnet.servers.some(server =>
        normalize(server.networkInfo?.serverNetworkDescription).includes(searchLower) ||
        normalize(server.networkInfo?.iloNetworkDescription).includes(searchLower)
      )

    const matchesDatacenter = !filterDatacenter ||
      subnet.datacenters[filterDatacenter] > 0

    const matchesSwitch = !filterSwitch ||
      subnet.servers.some(server => isServerMatchingSwitch(server))

    return matchesSearch && matchesDatacenter && matchesSwitch
  })

  // Filter duplicates based on search term
  const filteredDuplicates = duplicates.filter(duplicate => {
    // 1. Check switch filter first (dedicated field)
    if (filterSwitch) {
      const switchLower = filterSwitch.toLowerCase()
      const matchesSwitch = duplicate.servers.some(server => isServerMatchingSwitch(server))
      if (!matchesSwitch) return false
    }

    // 2. Check global search term
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()

    // Search by all fields
    return (
      duplicate.ip.toLowerCase().includes(searchLower) ||
      duplicate.servers.some(s => s.serverName.toLowerCase().includes(searchLower)) ||
      duplicate.datacenters.some(dc => dc.toLowerCase().includes(searchLower)) ||
      duplicate.ipTypes.some(t => t.toLowerCase().includes(searchLower)) ||
      duplicate.subnets.some(s => s.toLowerCase().includes(searchLower)) ||
      duplicate.servers.some(s =>
        (s.networkInfo?.serverNetworkDescription?.toLowerCase().includes(searchLower)) ||
        (s.networkInfo?.iloNetworkDescription?.toLowerCase().includes(searchLower))
      )
    )
  })

  // Load available IPs for a subnet
  const loadAvailableIPs = async (subnet) => {
    try {
      if (!availableIPs) {
        setLoadingAvailableIPs(true)
      }
      console.log(`🔍 Loading available IPs for subnet: ${subnet}`)

      // URL encode the subnet to handle special characters
      const encodedSubnet = encodeURIComponent(subnet)
      const response = await apiCall(`${API_ENDPOINTS.NETWORK.BASE}/subnets/${encodedSubnet}/available-ips`)

      if (response && response.ok) {
        const data = await response.json()
        console.log(`✅ Loaded available IPs: ${data.usage?.available || 0} available out of ${data.usage?.totalUsable || 0}`)
        setAvailableIPs(data)
      } else {
        console.error('❌ Failed to load available IPs')
        setAvailableIPs(null)
      }
    } catch (error) {
      console.error('❌ Available IPs error:', error)
      setAvailableIPs(null)
    } finally {
      setLoadingAvailableIPs(false)
    }
  }

  // Handle subnet card click to open detailed view
  const handleSubnetClick = (subnet) => {
    setSelectedSubnetDetail(subnet)
    setActiveTab('subnet-detail')
    setSearchTerm('') // Clear search when opening detail view

    // Load available IPs for this subnet
    loadAvailableIPs(subnet.subnet)
  }

  // Handle back to subnets list
  const handleBackToSubnets = () => {
    setActiveTab('subnets')
    setSelectedSubnetDetail(null)
    setAvailableIPs(null)
  }

  // Get unique datacenters for filter
  const allDatacenters = [...new Set(subnets.flatMap(s => Object.keys(s.datacenters)))].sort()

  if (loading && subnets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🔄</div>
          <p className="text-gray-600 font-medium font-inter">Analyzing network subnets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Network Analysis</h1>
          <p className="text-gray-600 mt-1">Subnet distribution and datacenter analysis</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            🔲 Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            📋 List
          </button>
          <button
            onClick={loadSubnetAnalysis}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('subnets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'subnets'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            🌐 Subnets ({subnets.length})
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'duplicates'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            ⚠️ Duplicate IPs ({duplicates.length})
          </button>
          <button
            onClick={() => setActiveTab('ilo-racks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'ilo-racks'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            🔧 iLO Racks ({iloRackData.length})
          </button>
          <button
            onClick={() => setActiveTab('switch-search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'switch-search'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            🔌 Switch Search
          </button>
          <button
            onClick={() => setActiveTab('switches')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'switches'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            🎛️ Switches ({switchData.length})
          </button>
          <button
            onClick={() => setActiveTab('ilo-testing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'ilo-testing'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            🧪 iLO Testing
          </button>
          <button
            onClick={() => setActiveTab('visual-racks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'visual-racks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            🗄️ Visual Racks
          </button>
          {activeTab === 'subnet-detail' && selectedSubnetDetail && (
            <button
              onClick={handleBackToSubnets}
              className="py-2 px-1 border-b-2 border-green-500 text-green-600 font-medium text-sm transition-colors"
            >
              📋 {selectedSubnetDetail.subnet} Details
              <span className="ml-2 text-xs bg-green-100 px-2 py-1 rounded">
                ← Back to Subnets
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🌐</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subnets</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalSubnets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📍</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total IPs</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalIPs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🏢</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Multi-DC Subnets</p>
                <p className="text-2xl font-bold text-orange-600">{summary.multiDatacenterSubnets}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('duplicates')}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-red-50 hover:border-red-300 transition-colors text-left w-full"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">⚠️</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Duplicate IPs</p>
                <p className="text-2xl font-bold text-red-600">{summary.duplicateIPs}</p>
                <p className="text-xs text-red-500 mt-1">Click to view details</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={
                activeTab === 'subnets'
                  ? "Search subnets, datacenters, switches..."
                  : "Search IPs, servers, switches, datacenters..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter by Switch Name..."
              value={filterSwitch}
              onChange={(e) => setFilterSwitch(e.target.value)}
              className="w-full px-3 py-2 border border-orange-300 bg-orange-50/10 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          {activeTab === 'subnets' && (
            <div className="sm:w-48">
              <select
                value={filterDatacenter}
                onChange={(e) => setFilterDatacenter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Datacenters</option>
                {allDatacenters.map(dc => (
                  <option key={dc} value={dc}>{dc}</option>
                ))}
              </select>
            </div>
          )}
          {activeTab === 'duplicates' && (
            <div className="sm:w-48">
              <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-lg border border-gray-300">
                {filteredDuplicates.length} of {duplicates.length} conflicts
              </div>
            </div>
          )}
        </div>

        {/* Search Help Text */}
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            {activeTab === 'subnets' ? (
              <>Searching in: subnet addresses, datacenter names, switch/port names</>
            ) : (
              <>Searching in: IP addresses, server names, switches, datacenters, IP types, subnets</>
            )}
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'subnets' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Subnet Analysis ({filteredSubnets.length} subnets)
            </h2>
          </div>

          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSubnets.map((subnet) => (
                  <div
                    key={subnet.subnet}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 transition-all cursor-pointer"
                    onClick={() => handleSubnetClick(subnet)}
                    title="Click to view all servers in this subnet"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-blue-700 truncate hover:text-blue-800">
                        {subnet.subnet}
                      </h3>
                      {subnet.isMultiDatacenter && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-1 py-0.5 rounded">
                          Multi-DC
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total IPs:</span>
                        <span className="font-medium">{subnet.totalIPs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Servers:</span>
                        <span className="font-medium">{subnet.serverCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Primary DC:</span>
                        <span className="font-medium truncate ml-2">{subnet.primaryDatacenter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">DCs:</span>
                        <span className="font-medium">{subnet.datacenterCount}</span>
                      </div>
                    </div>

                    {subnet.duplicateCount > 0 && (
                      <div className="mt-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded text-center">
                        ⚠️ {subnet.duplicateCount} Duplicates
                      </div>
                    )}

                    <div className="mt-3 flex justify-between text-xs">
                      <span className="text-green-600">🖥️ {subnet.serverIPs}</span>
                      <span className="text-blue-600">⚙️ {subnet.managementIPs}</span>
                      {subnet.additionalIPs > 0 && (
                        <span className="text-purple-600">➕ {subnet.additionalIPs}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card click
                        setSelectedSubnet(selectedSubnet === subnet.subnet ? null : subnet.subnet)
                      }}
                      className="w-full mt-3 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      {selectedSubnet === subnet.subnet ? 'Hide' : 'Quick View'}
                    </button>

                    <div className="mt-2 text-center">
                      <span className="text-xs text-blue-600 font-medium">
                        👆 Click card for full details
                      </span>
                    </div>

                    {/* Expanded Details */}
                    {selectedSubnet === subnet.subnet && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Datacenters:</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(subnet.datacenters).map(([dc, count]) => (
                                <span key={dc} className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                  {dc}: {count}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Servers ({subnet.servers.length}):</p>
                            <div className="max-h-20 overflow-y-auto">
                              {subnet.servers.slice(0, 5).map(server => (
                                <div
                                  key={server.name}
                                  className={`text-xs p-0.5 rounded ${isServerMatchingSwitch(server) ? 'bg-orange-100 text-orange-900 font-bold' : 'text-gray-600'}`}
                                >
                                  {server.name} ({server.datacenter})
                                  {server.networkInfo?.serverNetworkDescription && (
                                    <span className={`ml-1 ${isServerMatchingSwitch(server) ? 'text-orange-600' : 'text-blue-600'}`}>
                                      🔌 {server.networkInfo.serverNetworkDescription}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {subnet.servers.length > 5 && (
                                <div className="text-xs text-gray-500">
                                  +{subnet.servers.length - 5} more...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="divide-y divide-gray-200">
              {filteredSubnets.map((subnet) => (
                <div key={subnet.subnet} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3
                          className="text-lg font-semibold text-blue-700 hover:text-blue-800 cursor-pointer hover:underline"
                          onClick={() => handleSubnetClick(subnet)}
                          title="Click to view all servers in this subnet"
                        >
                          {subnet.subnet}
                        </h3>
                        {subnet.isMultiDatacenter && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            Multi-DC
                          </span>
                        )}
                        {subnet.duplicateCount > 0 && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {subnet.duplicateCount} Duplicates
                          </span>
                        )}
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          👆 Click for details
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total IPs:</span>
                          <span className="ml-1 font-medium">{subnet.totalIPs}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Servers:</span>
                          <span className="ml-1 font-medium">{subnet.serverCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Primary DC:</span>
                          <span className="ml-1 font-medium">{subnet.primaryDatacenter}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">DC Count:</span>
                          <span className="ml-1 font-medium">{subnet.datacenterCount}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">Datacenter Distribution:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(subnet.datacenters).map(([dc, count]) => (
                            <span key={dc} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {dc}: {count} IPs
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-4 text-sm">
                        <span className="text-green-600">🖥️ Server: {subnet.serverIPs}</span>
                        <span className="text-blue-600">⚙️ Management: {subnet.managementIPs}</span>
                        {subnet.additionalIPs > 0 && (
                          <span className="text-purple-600">➕ Additional: {subnet.additionalIPs}</span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => setSelectedSubnet(selectedSubnet === subnet.subnet ? null : subnet.subnet)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        {selectedSubnet === subnet.subnet ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>
                  </div>

                  {selectedSubnet === subnet.subnet && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Servers in this subnet ({subnet.servers.length}):
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subnet.servers.map(server => (
                          <div
                            key={server.name}
                            className={`rounded p-3 border transition-all ${isServerMatchingSwitch(server)
                              ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200 shadow-sm'
                              : 'bg-gray-50 border-gray-100'}`}
                          >
                            <div className="font-medium text-sm flex justify-between">
                              <span>{server.name}</span>
                              {isServerMatchingSwitch(server) && (
                                <span className="text-[10px] bg-orange-600 text-white px-1 rounded">MATCH</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{server.datacenter}</div>
                            <div className="mt-1">
                              {server.ips.map((ip, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${ip.type === 'server' ? 'bg-green-500' :
                                    ip.type === 'management' ? 'bg-blue-500' : 'bg-purple-500'
                                    }`}></span>
                                  {ip.ip}
                                </div>
                              ))}
                            </div>
                            {(server.networkInfo?.serverNetworkDescription || server.networkInfo?.iloNetworkDescription) && (
                              <div className="mt-2 text-xs border-t border-gray-100 pt-1">
                                {server.networkInfo.serverNetworkDescription && (
                                  <div className="text-blue-600 truncate" title={server.networkInfo.serverNetworkDescription}>
                                    🔌 Server: {server.networkInfo.serverNetworkDescription}
                                  </div>
                                )}
                                {server.networkInfo.iloNetworkDescription && (
                                  <div className="text-purple-600 truncate" title={server.networkInfo.iloNetworkDescription}>
                                    ⚙️ iLO: {server.networkInfo.iloNetworkDescription}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {filteredSubnets.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600">No subnets found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Duplicates Tab */}
      {activeTab === 'duplicates' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Duplicate IP Analysis ({filteredDuplicates.length} conflicts)
              {searchTerm && filteredDuplicates.length !== duplicates.length && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (filtered from {duplicates.length} total)
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              IP addresses that are assigned to multiple servers
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredDuplicates.map((duplicate, index) => (
              <div key={duplicate.ip} className="p-6 hover:bg-red-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-red-700">{duplicate.ip}</h3>
                      <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                        ⚠️ {duplicate.count} servers using this IP
                      </span>
                      {duplicate.datacenters.length > 1 && (
                        <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                          🏢 Cross-datacenter conflict
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Affected Servers:</span>
                        <span className="ml-1 font-medium text-red-600">{duplicate.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Datacenters:</span>
                        <span className="ml-1 font-medium">{duplicate.datacenters.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">IP Types:</span>
                        <span className="ml-1 font-medium">{duplicate.ipTypes.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Subnets:</span>
                        <span className="ml-1 font-medium">{duplicate.subnets.length}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Affected Datacenters:</p>
                      <div className="flex flex-wrap gap-2">
                        {duplicate.datacenters.map(dc => (
                          <span key={dc} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {dc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-3">
                        Servers sharing this IP address:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {duplicate.servers.map((server, idx) => (
                          <div key={`${server.serverName}-${idx}`} className="bg-red-50 border border-red-200 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm text-red-800">{server.serverName}</div>
                              <span className={`inline-block w-3 h-3 rounded-full ${server.ipType === 'server' ? 'bg-green-500' :
                                server.ipType === 'management' ? 'bg-blue-500' : 'bg-purple-500'
                                }`} title={server.ipType}></span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>📍 {server.datacenter}</div>
                              <div>🌐 {server.subnet}</div>
                              <div>🔧 {server.ipType} IP</div>
                              {server.networkInfo?.serverNetworkDescription && (
                                <div className="text-blue-600 font-medium">🔌 Switch: {server.networkInfo.serverNetworkDescription}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-start">
                        <div className="text-yellow-600 mr-2">⚠️</div>
                        <div className="text-sm text-yellow-800">
                          <strong>Conflict Resolution Required:</strong> This IP address is assigned to multiple servers,
                          which can cause network conflicts. Please review and reassign unique IP addresses to each server.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDuplicates.length === 0 && (
            <div className="text-center py-12">
              {duplicates.length === 0 ? (
                <>
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicate IPs Found</h3>
                  <p className="text-gray-600">All IP addresses are uniquely assigned. Great job!</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
                  <p className="text-gray-600">
                    No duplicate IPs match your search criteria. Try a different search term.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Search
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subnet Detail Tab */}
      {activeTab === 'subnet-detail' && selectedSubnetDetail && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedSubnetDetail.subnet} - Detailed View
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  All servers and IP addresses in this subnet
                </p>
              </div>
              <button
                onClick={handleBackToSubnets}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Subnets
              </button>
            </div>
          </div>

          {/* Subnet Overview */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedSubnetDetail.totalIPs}</div>
                <div className="text-sm text-gray-600">Total IPs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedSubnetDetail.serverCount}</div>
                <div className="text-sm text-gray-600">Servers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{selectedSubnetDetail.datacenterCount}</div>
                <div className="text-sm text-gray-600">Datacenters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedSubnetDetail.serverIPs}</div>
                <div className="text-sm text-gray-600">Server IPs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedSubnetDetail.managementIPs}</div>
                <div className="text-sm text-gray-600">Management IPs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{selectedSubnetDetail.additionalIPs}</div>
                <div className="text-sm text-gray-600">Additional IPs</div>
              </div>
            </div>

            {/* Datacenter Distribution */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Datacenter Distribution:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedSubnetDetail.datacenters).map(([dc, count]) => (
                  <span key={dc} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {dc}: {count} IPs
                  </span>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {selectedSubnetDetail.isMultiDatacenter && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                <div className="flex items-start">
                  <div className="text-orange-600 mr-2">⚠️</div>
                  <div className="text-sm text-orange-800">
                    <strong>Multi-Datacenter Subnet:</strong> This subnet spans multiple datacenters,
                    which may indicate network configuration that needs review.
                  </div>
                </div>
              </div>
            )}

            {selectedSubnetDetail.duplicateCount > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-start">
                  <div className="text-red-600 mr-2">🚨</div>
                  <div className="text-sm text-red-800">
                    <strong>Duplicate IPs Detected:</strong> {selectedSubnetDetail.duplicateCount} IP addresses
                    in this subnet are assigned to multiple servers. Check the Duplicate IPs tab for details.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available IPs Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available IP Addresses</h3>
              {loadingAvailableIPs && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Calculating...
                </div>
              )}
            </div>

            {availableIPs ? (
              <div className="space-y-6">
                {/* Network Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Network Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Network:</span>
                      <div className="font-mono text-blue-900">{availableIPs.networkInfo.networkIP}</div>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Subnet Mask:</span>
                      <div className="font-mono text-blue-900">{availableIPs.networkInfo.subnetMask}</div>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Broadcast:</span>
                      <div className="font-mono text-blue-900">{availableIPs.networkInfo.broadcastIP}</div>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Prefix:</span>
                      <div className="font-mono text-blue-900">/{availableIPs.networkInfo.prefixLength}</div>
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{availableIPs.usage.totalUsable}</div>
                    <div className="text-sm text-gray-600">Total Usable</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{availableIPs.usage.used}</div>
                    <div className="text-sm text-gray-600">Used IPs</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{availableIPs.usage.available}</div>
                    <div className="text-sm text-gray-600">Available IPs</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{availableIPs.usage.utilizationPercent}%</div>
                    <div className="text-sm text-gray-600">Utilization</div>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${availableIPs.usage.utilizationPercent}%` }}
                  ></div>
                </div>

                {/* Available IP Ranges */}
                {availableIPs.availableRanges && availableIPs.availableRanges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Available IP Ranges</h4>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {availableIPs.availableRanges.map((range, index) => (
                          <div key={index} className="bg-white rounded px-3 py-2 text-sm font-mono text-green-800 border border-green-200">
                            {range}
                          </div>
                        ))}
                      </div>
                      {availableIPs.hasMoreAvailable && (
                        <div className="mt-3 text-sm text-green-700">
                          + {availableIPs.totalAvailable - 100} more available IPs (showing first 100)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* First 20 Available IPs */}
                {availableIPs.availableIPs && availableIPs.availableIPs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Next Available IPs (showing first 20)
                    </h4>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {availableIPs.availableIPs.slice(0, 20).map((ip, index) => (
                          <div
                            key={index}
                            className="bg-white rounded px-3 py-2 text-sm font-mono text-green-800 border border-green-200 hover:bg-green-100 cursor-pointer transition-colors"
                            title="Click to copy IP address"
                            onClick={() => {
                              navigator.clipboard.writeText(ip)
                              // You could add a toast notification here
                            }}
                          >
                            {ip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* No Available IPs Warning */}
                {availableIPs.usage.available === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-red-600 mr-2">⚠️</div>
                      <div className="text-sm text-red-800">
                        <strong>Subnet Full:</strong> This subnet has no available IP addresses.
                        All {availableIPs.usage.totalUsable} usable IPs are currently assigned.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : !loadingAvailableIPs && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">IP Analysis Not Available</h3>
                <p className="text-gray-600">Unable to calculate available IPs for this subnet.</p>
              </div>
            )}
          </div>

          {/* Servers List */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              All Servers in {selectedSubnetDetail.subnet} ({selectedSubnetDetail.servers.length} servers)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSubnetDetail.servers.map((server, index) => (
                <div key={`${server.name}-${index}`} className={`border rounded-lg p-4 transition-all ${isServerMatchingSwitch(server)
                  ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200 shadow-sm'
                  : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900">{server.name}</h4>
                      {isServerMatchingSwitch(server) && (
                        <span className="ml-2 text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded font-bold">MATCH</span>
                      )}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {server.datacenter}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <strong>IP Addresses:</strong>
                    </div>
                    {server.ips.map((ipInfo, ipIndex) => (
                      <div key={ipIndex} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${ipInfo.type === 'server' ? 'bg-green-500' :
                            ipInfo.type === 'management' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}></span>
                          <span className="font-mono">{ipInfo.ip}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${ipInfo.type === 'server' ? 'bg-green-100 text-green-800' :
                          ipInfo.type === 'management' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                          {ipInfo.type}
                        </span>
                      </div>
                    ))}

                    <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
                      <div className="text-sm font-medium text-gray-700 mb-1">Network Connections:</div>
                      {server.networkInfo?.serverNetworkDescription ? (
                        <div className={`text-xs px-2 py-1.5 rounded flex items-center ${isServerMatchingSwitch(server) && server.networkInfo.serverNetworkDescription.toLowerCase().includes(filterSwitch.toLowerCase())
                          ? 'bg-orange-100 text-orange-900 border border-orange-200'
                          : 'bg-white text-gray-600 border border-gray-100'}`}>
                          <span className="mr-2">🔌</span>
                          <span className="font-medium mr-1 text-gray-500">Server:</span>
                          <span className="truncate">{server.networkInfo.serverNetworkDescription}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic px-2">No server switch info</div>
                      )}

                      {server.networkInfo?.iloNetworkDescription ? (
                        <div className={`text-xs px-2 py-1.5 rounded flex items-center ${isServerMatchingSwitch(server) && server.networkInfo.iloNetworkDescription.toLowerCase().includes(filterSwitch.toLowerCase())
                          ? 'bg-orange-100 text-orange-900 border border-orange-200'
                          : 'bg-white text-gray-600 border border-gray-100'}`}>
                          <span className="mr-2">⚙️</span>
                          <span className="font-medium mr-1 text-gray-500">iLO:</span>
                          <span className="truncate">{server.networkInfo.iloNetworkDescription}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic px-2">No iLO switch info</div>
                      )}
                    </div>
                  </div>

                  {server.ips.length === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      No IP addresses found
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedSubnetDetail.servers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Servers Found</h3>
                <p className="text-gray-600">This subnet doesn't contain any servers.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Racks Tab */}
      {activeTab === 'visual-racks' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">🗄️</span>
              Datacenter Rack Visualization
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Visual 42U rack elevation diagram for identifying physical server placement and health status.
            </p>
          </div>

          {loadingIloRacks ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Loading infrastructure mapping...</p>
            </div>
          ) : (
            <RackElevation
              servers={iloRackData.map(s => ({
                name: s.serverName,
                status: s.status || 'online',
                ipAddress: s.networkIP,
                vendor: s.category === 'complete' || s.category === 'ilo-only' ? 'HP' : 'Unknown',
                datacenter: s.datacenter,
                location: {
                  datacenter: s.datacenter,
                  rack: s.rack,
                  position: s.position
                },
                managementInterface: {
                  ip: s.iloIP
                }
              }))}
            />
          )}
        </div>
      )}
      {activeTab === 'ilo-racks' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              iLO IP to Rack Mapping ({iloRackData.length} servers)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Shows the relationship between iLO management IPs and their physical rack locations
            </p>
          </div>

          {loadingIloRacks ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading iLO rack data...</span>
            </div>
          ) : iloRackData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No iLO Data Found</h3>
              <p className="text-gray-600">No servers found with both iLO IP and rack location information.</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {iloRackData.filter(s => s.category === 'complete').length}
                  </div>
                  <div className="text-sm text-gray-600">Complete (iLO + Rack)</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {iloRackData.filter(s => s.category === 'ilo-only').length}
                  </div>
                  <div className="text-sm text-gray-600">iLO Only</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {iloRackData.filter(s => s.category === 'rack-only').length}
                  </div>
                  <div className="text-sm text-gray-600">Rack Only</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {iloRackData.filter(s => s.category === 'incomplete').length}
                  </div>
                  <div className="text-sm text-gray-600">Missing Both</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{iloRackData.length}</div>
                  <div className="text-sm text-gray-600">Total Servers</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {[...new Set(iloRackData.filter(s => s.rack).map(s => s.rack))].length}
                  </div>
                  <div className="text-sm text-gray-600">Unique Racks</div>
                </div>
                <div className="bg-teal-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {[...new Set(iloRackData.filter(s => s.iloSubnet).map(s => s.iloSubnet))].length}
                  </div>
                  <div className="text-sm text-gray-600">iLO Subnets</div>
                </div>
              </div>

              {/* Group by Category */}
              {['complete', 'ilo-only', 'rack-only', 'incomplete'].map(category => {
                const categoryServers = iloRackData.filter(s => s.category === category)
                if (categoryServers.length === 0) return null

                const categoryInfo = {
                  complete: { title: '✅ Complete Servers (iLO + Rack)', color: 'green', bgColor: 'bg-green-50' },
                  'ilo-only': { title: '🔧 iLO Only (Missing Rack Info)', color: 'blue', bgColor: 'bg-blue-50' },
                  'rack-only': { title: '🗄️ Rack Only (Missing iLO Info)', color: 'orange', bgColor: 'bg-orange-50' },
                  'incomplete': { title: '❌ Incomplete (Missing Both)', color: 'gray', bgColor: 'bg-gray-50' }
                }

                return (
                  <div key={category} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      {categoryInfo[category].title}
                      <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {categoryServers.length} servers
                      </span>
                    </h3>

                    {/* Group by Datacenter within Category */}
                    {[...new Set(categoryServers.map(s => s.datacenter))].map(datacenter => (
                      <div key={`${category}-${datacenter}`} className="mb-6">
                        <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                          🏢 {datacenter}
                          <span className="ml-2 text-sm text-gray-500 bg-white px-2 py-1 rounded">
                            {categoryServers.filter(s => s.datacenter === datacenter).length} servers
                          </span>
                        </h4>

                        {/* For complete servers, group by rack. For others, show directly */}
                        {category === 'complete' || category === 'rack-only' ? (
                          // Group by Rack for servers with rack info
                          [...new Set(categoryServers.filter(s => s.datacenter === datacenter && s.rack).map(s => s.rack))].map(rack => {
                            const rackId = `${category}-${datacenter}-${rack}`
                            const isExpanded = expandedRacks.has(rackId)
                            const rackServers = categoryServers.filter(s => s.datacenter === datacenter && s.rack === rack)

                            return (
                              <div key={rackId} className={`mb-4 ${categoryInfo[category].bgColor} rounded-lg overflow-hidden transition-all duration-300`}>
                                <div className="p-4">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                      🗄️ Rack {rack}
                                      <span className="ml-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                        {rackServers.length} servers
                                      </span>
                                    </h5>
                                    <button
                                      onClick={() => toggleRackExpansion(rackId)}
                                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                      <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                                      <svg
                                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                {/* Collapsible Content */}
                                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                  } overflow-hidden`}>
                                  <div className="px-4 pb-4">
                                    <div className="max-h-[600px] overflow-y-auto pr-2">

                                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {rackServers.map((server, index) => (
                                          <div key={`${server.serverName}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                              <h6 className="font-semibold text-gray-900 truncate">{server.serverName}</h6>
                                              <span className={`w-3 h-3 rounded-full ${server.status === 'online' ? 'bg-green-400' :
                                                server.status === 'offline' ? 'bg-red-400' :
                                                  server.status === 'maintenance' ? 'bg-yellow-400' :
                                                    'bg-gray-400'
                                                }`}></span>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                              {server.position && (
                                                <div className="flex items-center justify-between">
                                                  <span className="text-gray-600">Position:</span>
                                                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{server.position}</span>
                                                </div>
                                              )}

                                              {server.iloIP && (
                                                <div className="flex items-center justify-between">
                                                  <span className="text-gray-600">iLO IP:</span>
                                                  <div className="flex items-center space-x-2">
                                                    <span className="font-mono text-purple-600">{server.iloIP}</span>
                                                    <button
                                                      onClick={() => window.open(`https://${server.iloIP}`, '_blank')}
                                                      className="text-purple-600 hover:text-purple-800 text-xs"
                                                      title="Open iLO Interface"
                                                    >
                                                      🔗
                                                    </button>
                                                  </div>
                                                </div>
                                              )}

                                              {server.networkIP && (
                                                <div className="flex items-center justify-between">
                                                  <span className="text-gray-600">Network IP:</span>
                                                  <span className="font-mono text-blue-600">{server.networkIP}</span>
                                                </div>
                                              )}

                                              {server.networkPort && (
                                                <div className="flex items-center justify-between">
                                                  <span className="text-gray-600">Network Port:</span>
                                                  <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                                    {server.networkPort}
                                                  </span>
                                                </div>
                                              )}

                                              {server.iloPort && (
                                                <div className="flex items-center justify-between">
                                                  <span className="text-gray-600">iLO Port:</span>
                                                  <span className="font-mono text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                                    {server.iloPort}
                                                  </span>
                                                </div>
                                              )}

                                              {server.iloSubnet && (
                                                <div className="flex items-center justify-between">
                                                  <span className="text-gray-600">iLO Subnet:</span>
                                                  <span className="font-mono text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                    {server.iloSubnet}
                                                  </span>
                                                </div>
                                              )}

                                              {server.model !== 'Unknown' && (
                                                <div className="flex items-center justify-between">
                                                  <span className="text-gray-600">Model:</span>
                                                  <span className="text-gray-800 text-xs">{server.model}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          // Direct display for servers without rack info
                          <div className={`${categoryInfo[category].bgColor} rounded-lg p-4`}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                              {categoryServers
                                .filter(s => s.datacenter === datacenter)
                                .map((server, index) => (
                                  <div key={`${server.serverName}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                      <h6 className="font-semibold text-gray-900 truncate">{server.serverName}</h6>
                                      <span className={`w-3 h-3 rounded-full ${server.status === 'online' ? 'bg-green-400' :
                                        server.status === 'offline' ? 'bg-red-400' :
                                          server.status === 'maintenance' ? 'bg-yellow-400' :
                                            'bg-gray-400'
                                        }`}></span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                      {server.position && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">Position:</span>
                                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{server.position}</span>
                                        </div>
                                      )}

                                      {server.iloIP && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">iLO IP:</span>
                                          <div className="flex items-center space-x-2">
                                            <span className="font-mono text-purple-600">{server.iloIP}</span>
                                            <button
                                              onClick={() => window.open(`https://${server.iloIP}`, '_blank')}
                                              className="text-purple-600 hover:text-purple-800 text-xs"
                                              title="Open iLO Interface"
                                            >
                                              🔗
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {server.networkIP && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">Network IP:</span>
                                          <span className="font-mono text-blue-600">{server.networkIP}</span>
                                        </div>
                                      )}

                                      {server.networkPort && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">Network Port:</span>
                                          <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                            {server.networkPort}
                                          </span>
                                        </div>
                                      )}

                                      {server.iloPort && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">iLO Port:</span>
                                          <span className="font-mono text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                            {server.iloPort}
                                          </span>
                                        </div>
                                      )}

                                      {server.iloSubnet && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">iLO Subnet:</span>
                                          <span className="font-mono text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                            {server.iloSubnet}
                                          </span>
                                        </div>
                                      )}

                                      {server.model !== 'Unknown' && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">Model:</span>
                                          <span className="text-gray-800 text-xs">{server.model}</span>
                                        </div>
                                      )}

                                      {/* Show what's missing */}
                                      {category === 'ilo-only' && (
                                        <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                          ⚠️ Missing rack location
                                        </div>
                                      )}
                                      {category === 'rack-only' && (
                                        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          ⚠️ Missing iLO IP
                                        </div>
                                      )}
                                      {category === 'incomplete' && (
                                        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                          ⚠️ Missing iLO IP and rack location
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      )}

      {/* Switch Search Tab */}
      {activeTab === 'switch-search' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Switch Connectivity Search
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Flat list of all servers connected to specific switches
              </p>
            </div>
            {filterSwitch && (
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                Showing servers for: {filterSwitch}
              </div>
            )}
          </div>

          <div className="p-6">
            {!filterSwitch ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-4">🔌</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a Switch Name</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Type a switch name or port description in the filter box above to see all connected servers across different subnets.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Found <strong>{iloRackData.filter(isServerMatchingSwitch).length}</strong> servers matching "{filterSwitch}"
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datacenter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rack / Pos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server IP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Switch Port</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">iLO Port</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {iloRackData.filter(isServerMatchingSwitch).map((server, idx) => (
                        <tr key={`${server.serverName}-${idx}`} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{server.serverName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{server.model}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {server.datacenter}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {server.rack ? `R:${server.rack}` : '-'} / {server.position || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-blue-600">{server.networkIP}</div>
                            {server.iloIP && <div className="text-[10px] font-mono text-purple-600">iLO: {server.iloIP}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {server.networkPort ? (
                              <div className={`text-xs px-2 py-1 rounded inline-block ${(() => {
                                const norm = (str) => (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
                                return norm(server.networkPort).includes(norm(filterSwitch));
                              })() ? 'bg-orange-100 text-orange-800 font-bold' : 'bg-gray-100 text-gray-600'}`}>
                                {server.networkPort}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {server.iloPort ? (
                              <div className={`text-xs px-2 py-1 rounded inline-block ${(() => {
                                const norm = (str) => (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
                                return norm(server.iloPort).includes(norm(filterSwitch));
                              })() ? 'bg-orange-100 text-orange-800 font-bold' : 'bg-gray-100 text-gray-600'}`}>
                                {server.iloPort}
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {iloRackData.filter(isServerMatchingSwitch).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-2xl mb-2">🔍</div>
                    <p className="text-gray-500">No servers found matching "{filterSwitch}" in any network description.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Switches Tab (Card View) */}
      {activeTab === 'switches' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Switch Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Browse all unique switches detected in the environment
              </p>
            </div>
            <button
              onClick={loadSwitchData}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh Switches
            </button>
          </div>

          <div className="p-6">
            {loadingSwitches ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
                <p className="text-gray-500">Inventorying switches...</p>
              </div>
            ) : switchData.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-4">🎛️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Switches Detected</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn't find any switches in your server database. Ensure switch information is populated in the network description fields.
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {[...new Set(switchData.map(sw => sw.datacenters[0] || 'Unknown'))].sort().map(dc => (
                  <div key={dc}>
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="bg-teal-100 text-teal-800 p-2 rounded-lg mr-3 text-lg">🏢</span>
                      Datacenter: {dc}
                      <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {switchData.filter(sw => (sw.datacenters[0] || 'Unknown') === dc).length} switches
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {switchData.filter(sw => (sw.datacenters[0] || 'Unknown') === dc).map((sw, idx) => (
                        <div
                          key={`${sw.name}-${idx}`}
                          onClick={() => {
                            setFilterSwitch(sw.name)
                            setActiveTab('switch-search')
                          }}
                          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
                        >
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <div className="text-4xl">🔌</div>
                          </div>

                          <h3 className="text-md font-bold text-gray-900 mb-3 group-hover:text-teal-700 pr-8 line-clamp-2 leading-tight" title={sw.name}>
                            {sw.name}
                          </h3>

                          <div className="space-y-3 mt-auto">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Connections</span>
                              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-bold">
                                {sw.serverCount} Servers
                              </span>
                            </div>

                            {sw.datacenters.length > 1 && (
                              <div className="space-y-1">
                                <span className="text-xs text-gray-500 block">All Datacenters:</span>
                                <div className="flex flex-wrap gap-1">
                                  {sw.datacenters.map(dcName => (
                                    <span key={dcName} className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded">
                                      {dcName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-teal-600 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                            View Connected Servers
                            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* iLO Testing Tab */}
      {activeTab === 'ilo-testing' && (
        <IloTestingPage />
      )}
    </div>
  )
}

// Users Management Page Component
const UsersPage = () => {
  const { hasPermission } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordUser, setPasswordUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('👥 Loading users...')

      const response = await apiCall(`${API_ENDPOINTS.USERS.BASE}`)

      if (response && response.ok) {
        const data = await response.json()
        console.log(`✅ Loaded ${data.users?.length || 0} users`)
        setUsers(data.users || [])
      } else {
        console.error('❌ Failed to load users')
        alert('Failed to load users')
      }
    } catch (error) {
      console.error('❌ Error loading users:', error)
      alert(`Error loading users: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = !filterRole || user.role === filterRole

    return matchesSearch && matchesRole
  })

  // Handle user creation
  const handleCreateUser = async (userData) => {
    try {
      console.log('👤 Creating user...')

      const response = await apiCall(`${API_ENDPOINTS.USERS.BASE}`, {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      if (response && response.ok) {
        console.log('✅ User created successfully')
        setShowAddForm(false)
        loadUsers() // Reload users list
        alert('User created successfully!')
      } else {
        const error = await response.json()
        console.error('❌ Failed to create user:', error)
        alert(error.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('❌ Error creating user:', error)
      alert(`Error creating user: ${error.message}`)
    }
  }

  // Handle user update
  const handleUpdateUser = async (userId, userData) => {
    try {
      console.log('👤 Updating user...')

      const response = await apiCall(`${API_ENDPOINTS.USERS.BASE}/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      })

      if (response && response.ok) {
        console.log('✅ User updated successfully')
        setShowEditForm(false)
        setSelectedUser(null)
        loadUsers() // Reload users list
        alert('User updated successfully!')
      } else {
        const error = await response.json()
        console.error('❌ Failed to update user:', error)
        alert(error.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('❌ Error updating user:', error)
      alert(`Error updating user: ${error.message}`)
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      console.log('🗑️ Deleting user...')

      const response = await apiCall(`${API_ENDPOINTS.USERS.BASE}/${userId}`, {
        method: 'DELETE'
      })

      if (response && response.ok) {
        console.log('✅ User deleted successfully')
        setShowDeleteModal(false)
        setUserToDelete(null)
        loadUsers() // Reload users list
        alert('User deleted successfully!')
      } else {
        const error = await response.json()
        console.error('❌ Failed to delete user:', error)
        alert(error.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error)
      alert(`Error deleting user: ${error.message}`)
    }
  }

  // Handle password reset
  const handlePasswordReset = async (userId, newPassword) => {
    try {
      console.log('🔑 Resetting password...')

      const response = await apiCall(`${API_ENDPOINTS.USERS.BASE}/${userId}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword })
      })

      if (response && response.ok) {
        console.log('✅ Password reset successfully')
        setShowPasswordModal(false)
        setPasswordUser(null)
        alert('Password reset successfully!')
      } else {
        const error = await response.json()
        console.error('❌ Failed to reset password:', error)
        alert(error.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('❌ Error resetting password:', error)
      alert(`Error resetting password: ${error.message}`)
    }
  }

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'operator': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑'
      case 'operator': return '⚙️'
      case 'viewer': return '👁️'
      default: return '👤'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        {hasPermission('users.write') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            ➕ Add User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👑</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⚙️</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Operators</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'operator').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="hardware">Hardware</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{getRoleIcon(user.role)}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username} • {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {user.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {hasPermission('users.write') && (
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowEditForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                          title="Edit user"
                        >
                          ✏️
                        </button>
                      )}
                      {hasPermission('users.write') && (
                        <button
                          onClick={() => {
                            setPasswordUser(user)
                            setShowPasswordModal(true)
                          }}
                          className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded hover:bg-yellow-50"
                          title="Reset password"
                        >
                          🔑
                        </button>
                      )}
                      {hasPermission('users.delete') && (
                        <button
                          onClick={() => {
                            setUserToDelete(user)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                          title="Delete user"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-600">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const userData = {
                  username: formData.get('username'),
                  email: formData.get('email'),
                  password: formData.get('password'),
                  firstName: formData.get('firstName'),
                  lastName: formData.get('lastName'),
                  role: formData.get('role')
                }
                handleCreateUser(userData)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username *</label>
                    <input
                      type="text"
                      name="username"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password *</label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength="6"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role *</label>
                    <select
                      name="role"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="hardware">Hardware</option>
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const userData = {
                  username: formData.get('username'),
                  email: formData.get('email'),
                  firstName: formData.get('firstName'),
                  lastName: formData.get('lastName'),
                  role: formData.get('role'),
                  isActive: formData.get('isActive') === 'true'
                }
                handleUpdateUser(selectedUser._id || selectedUser.id, userData)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username *</label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={selectedUser.username}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={selectedUser.email}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={selectedUser.firstName || ''}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={selectedUser.lastName || ''}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role *</label>
                    <select
                      name="role"
                      defaultValue={selectedUser.role}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="isActive"
                      defaultValue={selectedUser.isActive ? 'true' : 'false'}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false)
                      setSelectedUser(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && passwordUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reset Password for {passwordUser.username}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const newPassword = formData.get('password')
                const confirmPassword = formData.get('confirmPassword')

                if (newPassword !== confirmPassword) {
                  alert('Passwords do not match!')
                  return
                }

                handlePasswordReset(passwordUser._id || passwordUser.id, newPassword)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password *</label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength="6"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength="6"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordUser(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete User</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete user <strong>{userToDelete.username}</strong>?
                  This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setUserToDelete(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(userToDelete._id || userToDelete.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Server Form Component
const ServerForm = ({ server, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: server?.name || '',
    ip: server?.ipAddress || server?.ip || '',
    vendor: server?.vendor || '',
    model: server?.model || '',
    managementInterface: {
      type: server?.managementInterface?.type || '',
      ip: server?.managementInterface?.ip || '',
      username: server?.managementInterface?.username || '',
      password: '', // Always start with empty password for security
      enabled: server?.managementInterface?.enabled || false
    },
    networkInfo: {
      serverNetworkDescription: server?.networkInfo?.serverNetworkDescription || '',
      iloNetworkDescription: server?.networkInfo?.iloNetworkDescription || ''
    },
    location: {
      datacenter: server?.location?.datacenter || '',
      rack: server?.location?.rack || '',
      position: server?.location?.position || ''
    }
  })

  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    // Transform data to match backend API expectations
    const serverData = {
      name: formData.name,
      ipAddress: formData.ip, // Backend expects 'ipAddress', not 'ip'
      type: 'physical', // Required by backend
      vendor: formData.vendor,
      model: formData.model,
      managementInterface: {
        ...formData.managementInterface,
        // Don't overwrite existing password if field is empty during edit
        ...(server && !formData.managementInterface.password ? { password: server.managementInterface?.password } : {})
      },
      networkInfo: formData.networkInfo,
      location: formData.location,
      status: 'offline',
      powerState: 'Unknown'
    }

    onSave(serverData)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-3xl mr-3">🖥️</span>
          {server ? 'Edit Server' : 'Add Server'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure server details and management interface
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Server Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Server IP Address</label>
              <input
                type="text"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 192.168.1.100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Main server IP address (OS/application access)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor</label>
              <select
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select vendor</option>
                <option value="HP">HP</option>
                <option value="HPE">HPE</option>
                <option value="Dell">Dell</option>
                <option value="Lenovo">Lenovo</option>
                <option value="IBM">IBM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Management Interface */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Management Interface (iLO/iDRAC)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Management Type</label>
              <select
                value={formData.managementInterface.type}
                onChange={(e) => setFormData({
                  ...formData,
                  managementInterface: { ...formData.managementInterface, type: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                <option value="iLO">HP iLO</option>
                <option value="iDRAC">Dell iDRAC</option>
                <option value="IPMI">IPMI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Management IP Address</label>
              <input
                type="text"
                value={formData.managementInterface.ip}
                onChange={(e) => setFormData({
                  ...formData,
                  managementInterface: { ...formData.managementInterface, ip: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 192.168.1.101"
              />
              <p className="text-xs text-gray-500 mt-1">iLO/iDRAC IP address (hardware management)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={formData.managementInterface.username}
                onChange={(e) => setFormData({
                  ...formData,
                  managementInterface: { ...formData.managementInterface, username: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Management username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.managementInterface.password}
                  onChange={(e) => setFormData({
                    ...formData,
                    managementInterface: { ...formData.managementInterface, password: e.target.value }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={server ? "Leave empty to keep existing password" : "Management password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                🔐 Password will be securely encoded when saved
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.managementInterface.enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    managementInterface: { ...formData.managementInterface, enabled: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Management Interface</span>
              </label>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Server Network Description</label>
              <input
                type="text"
                value={formData.networkInfo.serverNetworkDescription}
                onChange={(e) => setFormData({
                  ...formData,
                  networkInfo: { ...formData.networkInfo, serverNetworkDescription: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., AMS EXA MAIN SWITCH 11 p/23"
              />
              <p className="text-xs text-gray-500 mt-1">Network switch and port information for the main server connection</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">iLO Network Description</label>
              <input
                type="text"
                value={formData.networkInfo.iloNetworkDescription}
                onChange={(e) => setFormData({
                  ...formData,
                  networkInfo: { ...formData.networkInfo, iloNetworkDescription: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., iLo sw023 p/28"
              />
              <p className="text-xs text-gray-500 mt-1">Network switch and port information for the iLO management interface</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">ℹ️</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Network Information</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Enter the network switch and port information for both the main server connection and the iLO management interface. This information will be displayed in the network interface section instead of auto-detected interfaces.</p>
                  <p className="mt-1"><strong>Example:</strong> "AMS EXA MAIN SWITCH 11 p/23" for server network, "iLo sw023 p/28" for iLO network</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Datacenter</label>
              <input
                type="text"
                value={formData.location.datacenter}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, datacenter: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., DC-East-01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rack</label>
              <input
                type="text"
                value={formData.location.rack}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, rack: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., R-42"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                value={formData.location.position}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, position: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., U1-U4"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {server ? 'Update Server' : 'Add Server'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Server Management Component (iLO/iDRAC Interface)
const ServerManagement = ({ server, onBack, onExportToNotepad }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [serverInfo, setServerInfo] = useState(null)
  const [infoLoading, setInfoLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncingLogs, setSyncingLogs] = useState(false)
  const [showCredentialModal, setShowCredentialModal] = useState(false)
  const [iloCredentials, setIloCredentials] = useState(null)
  const [showCredentialInputModal, setShowCredentialInputModal] = useState(false)
  const [credentialInputData, setCredentialInputData] = useState({ username: 'admin', password: '' })

  // Load real server information from management interface
  useEffect(() => {
    loadServerInfo()
  }, [])

  const loadServerInfo = async () => {
    try {
      setInfoLoading(true)
      const token = localStorage.getItem('token')

      console.log(`📡 Loading server info for ${server.name}...`)

      const response = await fetch(`http://localhost:5000/api/server-management/${server._id}/info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setServerInfo(result.data)
        console.log('✅ Server info loaded:', result.data)
      } else {
        const error = await response.json()
        console.error('❌ Failed to load server info:', error)
        // Use fallback data if management interface is not available
        setServerInfo({
          system: {
            powerState: server.powerState || 'Unknown',
            status: server.status || 'Unknown'
          }
        })
      }
    } catch (error) {
      console.error('❌ Server info error:', error)
      // Use fallback data
      setServerInfo({
        system: {
          powerState: server.powerState || 'Unknown',
          status: server.status || 'Unknown'
        }
      })
    } finally {
      setInfoLoading(false)
    }
  }

  const handlePowerAction = async (action) => {
    setLoading(true)

    try {
      // Map frontend actions to backend API actions
      const actionMap = {
        'on': 'power_on',
        'off': 'power_off',
        'restart': 'power_cycle',
        'graceful_shutdown': 'graceful_shutdown'
      }

      const apiAction = actionMap[action] || action

      console.log(`🔌 Sending ${apiAction} command to ${server.name}...`)

      const response = await apiCall(`${API_ENDPOINTS.SERVER_MANAGEMENT.BY_ID(server._id)}/power`, {
        method: 'POST',
        body: JSON.stringify({ action: apiAction })
      })

      if (response && response.ok) {
        const result = await response.json()
        alert(`✅ ${result.message}`)
        console.log('✅ Power command successful:', result)

        // Refresh server info after a short delay to see power state change
        setTimeout(() => {
          console.log('🔄 Refreshing server info after power command...')
          loadServerInfo()
        }, 3000)

      } else if (response) {
        const error = await response.json()
        alert(`❌ Power command failed: ${error.details || error.error}`)
        console.error('❌ Power command failed:', error)
      }
    } catch (error) {
      console.error('❌ Power control error:', error)
      alert(`❌ Failed to send power command: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncFromiLO = async (credentials = null) => {
    // Check if server has password or credentials are provided
    const hasPassword = server.managementInterface?.password && server.managementInterface.password.trim() !== ''

    if (!hasPassword && !credentials) {
      // No password stored and no credentials provided - show input modal
      console.log(`🔐 No iLO password found for ${server.name}, requesting credentials...`)
      setCredentialInputData({ username: server.managementInterface?.username || 'admin', password: '' })
      setShowCredentialInputModal(true)
      return
    }

    setSyncing(true)

    try {
      console.log(`🔄 Syncing server data from iLO for ${server.name}...`)

      // Prepare request body with credentials if provided
      const requestBody = credentials ? {
        credentials: {
          username: credentials.username,
          password: credentials.password
        }
      } : {}

      const response = await apiCall(API_ENDPOINTS.SERVER_MANAGEMENT.SYNC(server._id), {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      if (response && response.ok) {
        const result = await response.json()
        alert(`✅ ${result.message}\n\nSynced Data:\n${JSON.stringify(result.syncedData, null, 2)}`)
        console.log('✅ Server sync successful:', result)

        // Real-time update: Get fresh server data and update the current view
        console.log('🔄 Updating server data in real-time...')

        // Fetch updated server data from the backend
        const serverResponse = await apiCall(API_ENDPOINTS.SERVERS.BY_ID(server._id))

        if (serverResponse && serverResponse.ok) {
          const response = await serverResponse.json()
          const updatedServerData = response.server // Extract server data from response wrapper
          console.log('✅ Real-time server data updated:', updatedServerData)

          // Update the server object with fresh data
          Object.assign(server, updatedServerData)

          // Force a re-render by updating server info
          loadServerInfo()
        }

      } else if (response) {
        const error = await response.json()
        alert(`❌ Sync failed: ${error.details || error.error}`)
        console.error('❌ Server sync failed:', error)
      }
    } catch (error) {
      console.error('❌ Sync error:', error)
      alert(`❌ Failed to sync server data: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncWithTestingCredentials = async () => {
    setSyncing(true)

    try {
      console.log(`🧪 Syncing server data using secure testing credentials for ${server.name}...`)

      // Use the regular sync endpoint but with testing credentials
      const testingCredentials = {
        username: 'team',
        password: 'kc4^QOVuzRn5'
      };

      const requestBody = {
        credentials: testingCredentials
      };

      const response = await apiCall(API_ENDPOINTS.SERVER_MANAGEMENT.SYNC(server._id), {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      if (response && response.ok) {
        const result = await response.json()
        alert(`✅ ${result.message}\n\nSynced Data:\n${JSON.stringify(result.syncedData, null, 2)}`)
        console.log('✅ Server sync with testing credentials successful:', result)

        // Real-time update: Get fresh server data and update the current view
        console.log('🔄 Updating server data in real-time...')

        // Fetch updated server data from the backend
        const serverResponse = await apiCall(API_ENDPOINTS.SERVERS.BY_ID(server._id))

        if (serverResponse && serverResponse.ok) {
          const response = await serverResponse.json()
          const updatedServerData = response.server // Extract server data from response wrapper
          console.log('✅ Real-time server data updated:', updatedServerData)

          // Update the server object with fresh data
          Object.assign(server, updatedServerData)

          // Force a re-render by updating server info
          loadServerInfo()
        }

      } else if (response) {
        const error = await response.json()
        alert(`❌ Sync failed: ${error.details || error.error}`)
        console.error('❌ Server sync with testing credentials failed:', error)
      }
    } catch (error) {
      console.error('❌ Sync error:', error)
      alert(`❌ Failed to sync server data: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleCredentialSubmit = async () => {
    if (!credentialInputData.username || !credentialInputData.password) {
      alert('Please enter both username and password')
      return
    }

    try {
      console.log(`🔐 Saving credentials and syncing ${server.name}...`)

      // Close the modal first
      setShowCredentialInputModal(false)

      // Start sync with provided credentials
      await handleSyncFromiLO(credentialInputData)

    } catch (error) {
      console.error('❌ Credential submit error:', error)
      alert(`❌ Failed to save credentials: ${error.message}`)
    }
  }

  const handleSyncLogsOnly = async () => {
    setSyncingLogs(true)

    try {
      const token = localStorage.getItem('token')

      console.log(`📝 Syncing logs only for ${server.name}...`)

      // Call the sync endpoint but focus on logs
      const response = await fetch(`http://localhost:5000/api/server-management/${server._id}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        const logCount = result.syncedData.systemLogs || 0
        alert(`✅ Logs synced successfully!\n\nRetrieved ${logCount} system log entries from iLO`)
        console.log('✅ Logs sync successful:', result)

        // Real-time update: Get fresh server data and update the current view
        console.log('🔄 Updating logs data in real-time...')

        // Fetch updated server data from the backend
        const serverResponse = await fetch(`http://localhost:5000/api/servers/${server._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (serverResponse.ok) {
          const response = await serverResponse.json()
          const updatedServerData = response.server // Extract server data from response wrapper
          console.log('✅ Real-time logs data updated:', updatedServerData.systemLogs?.length || 0, 'logs')

          // Update the server object with fresh data
          Object.assign(server, updatedServerData)

          // Force a re-render by updating server info
          loadServerInfo()
        }

      } else {
        const error = await response.json()
        alert(`❌ Logs sync failed: ${error.details || error.error}`)
        console.error('❌ Logs sync failed:', error)
      }
    } catch (error) {
      console.error('❌ Logs sync error:', error)
      alert(`❌ Failed to sync logs: ${error.message}`)
    } finally {
      setSyncingLogs(false)
    }
  }

  const handlePing = async (ipAddress, description = '') => {
    try {
      console.log(`🏓 Creating ping batch file for ${ipAddress}...`)

      const response = await apiCall(API_ENDPOINTS.SERVER_MANAGEMENT.PING(server._id), {
        method: 'POST',
        body: JSON.stringify({
          ipAddress: ipAddress,
          description: description
        })
      })

      if (response && response.ok) {
        // Get filename from response headers
        const fileName = response.headers.get('X-Ping-Filename') ||
          `ping-${ipAddress.replace(/\./g, '_')}.bat`
        const pingIP = response.headers.get('X-Ping-IP') || ipAddress
        const pingDescription = response.headers.get('X-Ping-Description') || description

        // Get the batch file content
        const batchContent = await response.text()

        // Create blob and download
        const blob = new Blob([batchContent], { type: 'application/octet-stream' })
        const downloadUrl = window.URL.createObjectURL(blob)

        // Create temporary download link
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        window.URL.revokeObjectURL(downloadUrl)

        alert(`🏓 Ping batch file downloaded!\n\n📁 File: ${fileName}\n🎯 Target: ${pingIP} (${pingDescription})\n\n✅ Instructions:\n1. Check your Downloads folder\n2. Double-click the .bat file to run\n3. CMD window will open and start pinging\n4. Press Ctrl+C to stop ping`)
        console.log('✅ Ping batch file downloaded:', { fileName, pingIP, pingDescription })
      } else if (response) {
        const error = await response.text()
        console.error('❌ Ping failed:', error)
        alert(`❌ Failed to create ping file: ${error}`)
      }
    } catch (error) {
      console.error('❌ Ping error:', error)
      alert(`❌ Failed to create ping file: ${error.message}`)
    }
  }

  const handleOpeniLO = async () => {
    try {
      console.log(`🌐 Opening iLO interface for ${server.name}...`)

      const response = await apiCall(API_ENDPOINTS.SERVER_MANAGEMENT.OPEN_ILO(server._id), {
        method: 'POST'
      })

      if (response && response.ok) {
        const result = await response.json()
        console.log('✅ iLO interface opened:', result)

        // Open iLO in new tab and show credentials in modal
        if (result.iloUrl && result.credentials) {
          // Open iLO in new tab
          window.open(result.iloUrl, '_blank')

          // Store credentials and show modal
          setIloCredentials(result)
          setShowCredentialModal(true)
        }
      } else if (response) {
        const error = await response.json()
        console.error('❌ Failed to open iLO:', error)
        alert(`❌ Failed to open iLO: ${error.details || error.error}`)
      }
    } catch (error) {
      console.error('❌ iLO access error:', error)
      alert(`❌ Failed to access iLO: ${error.message}`)
    }
  }

  const copyToClipboard = async (text, elementId) => {
    try {
      await navigator.clipboard.writeText(text)

      // Visual feedback
      const element = document.getElementById(elementId)
      if (element) {
        const originalText = element.textContent
        element.textContent = 'Copied!'
        element.style.background = '#10b981'
        setTimeout(() => {
          element.textContent = originalText
          element.style.background = '#3b82f6'
        }, 1000)
      }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      // Visual feedback
      const element = document.getElementById(elementId)
      if (element) {
        const originalText = element.textContent
        element.textContent = 'Copied!'
        element.style.background = '#10b981'
        setTimeout(() => {
          element.textContent = originalText
          element.style.background = '#3b82f6'
        }, 1000)
      }
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Servers
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-3">🖥️</span>
              {server.name} Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {server.managementInterface?.type} • {server.managementInterface?.ip}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => onExportToNotepad(server._id)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-2"
            >
              <span>📄</span>
              <span>Export to Notepad</span>
            </button>
            {server.managementInterface?.enabled && (
              <>
                <button
                  onClick={handleOpeniLO}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
                >
                  <span>🌐</span>
                  <span>Open iLO</span>
                </button>
                <button
                  onClick={handleSyncFromiLO}
                  disabled={syncing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <span className={syncing ? 'animate-spin' : ''}>🔄</span>
                  <span>{syncing ? 'Syncing...' : 'Sync from iLO'}</span>
                </button>
                <button
                  onClick={handleSyncWithTestingCredentials}
                  disabled={syncing}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <span className={syncing ? 'animate-spin' : ''}>🧪</span>
                  <span>{syncing ? 'Syncing...' : 'Sync (Secure)'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Overview */}
      {infoLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Power State</p>
                <p className={`text-lg font-semibold ${serverInfo?.system?.powerState === 'On' ? 'text-green-600' :
                  serverInfo?.system?.powerState === 'Off' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                  {serverInfo?.system?.powerState || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">❤️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Health Status</p>
                <p className={`text-lg font-semibold ${serverInfo?.system?.status === 'OK' ? 'text-green-600' :
                  serverInfo?.system?.status === 'Critical' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                  {serverInfo?.system?.status || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🌡️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Temperature</p>
                <p className={`text-lg font-semibold ${serverInfo?.temperatures?.some(t => t.status !== 'OK') ? 'text-red-600' : 'text-green-600'
                  }`}>
                  {serverInfo?.temperatures?.some(t => t.status !== 'OK') ? 'Warning' : 'Normal'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💾</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Storage</p>
                <p className={`text-lg font-semibold ${serverInfo?.storage?.status === 'OK' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                  {serverInfo?.storage?.status || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Power Control */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Power Control</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handlePowerAction('on')}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Power On
          </button>
          <button
            onClick={() => handlePowerAction('off')}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Force Off
          </button>
          <button
            onClick={() => handlePowerAction('restart')}
            disabled={loading}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            Restart
          </button>
          <button
            onClick={() => handlePowerAction('graceful_shutdown')}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            Graceful Shutdown
          </button>
        </div>
        {loading && (
          <p className="mt-4 text-sm text-gray-600">Executing power command...</p>
        )}
      </div>

      {/* Information Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'System Overview' },
              { id: 'hardware', name: 'Hardware' },
              { id: 'network', name: 'Network' },
              { id: 'logs', name: 'Logs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">System Information</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                    <dd className="text-sm text-gray-900">{server.vendor}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Model</dt>
                    <dd className="text-sm text-gray-900">{serverInfo?.system?.model || server.model}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                    <dd className="text-sm text-gray-900">{server.serialNumber || serverInfo?.system?.serialNumber || 'Not available'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">BIOS Version</dt>
                    <dd className="text-sm text-gray-900">{server.biosVersion || serverInfo?.system?.biosVersion || 'Not available'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Processor Count</dt>
                    <dd className="text-sm text-gray-900">{server.processorCount || serverInfo?.processors?.count || serverInfo?.system?.processorSummary?.count || 'Not available'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Memory</dt>
                    <dd className="text-sm text-gray-900">{server.totalMemoryGB || serverInfo?.memory?.totalSystemMemoryGiB || serverInfo?.system?.memorySummary?.totalSystemMemoryGiB ? `${server.totalMemoryGB || serverInfo?.memory?.totalSystemMemoryGiB || serverInfo?.system?.memorySummary?.totalSystemMemoryGiB} GB` : 'Not available'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Synced</dt>
                    <dd className="text-sm text-gray-900">{server.lastSynced ? new Date(server.lastSynced).toLocaleString() : 'Never'}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Power Information</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Power Consumed</dt>
                    <dd className="text-sm text-gray-900">{server.powerConsumption ? `${server.powerConsumption} W` : 'Not available'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Power Capacity</dt>
                    <dd className="text-sm text-gray-900">{server.powerCapacity ? `${server.powerCapacity} W` : 'Not available'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Power Efficiency</dt>
                    <dd className="text-sm text-gray-900">
                      {server.powerConsumption && server.powerCapacity ?
                        `${Math.round((server.powerConsumption / server.powerCapacity) * 100)}%` :
                        'Not available'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Power Supplies</dt>
                    <dd className="text-sm text-gray-900">{server.powerSupplies?.length || 'Not available'}</dd>
                  </div>
                </dl>
                {server.powerSupplies && server.powerSupplies.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Power Supply Details</h5>
                    <div className="space-y-2">
                      {server.powerSupplies.map((psu, index) => (
                        <div key={index} className="text-xs bg-gray-100 p-2 rounded border">
                          <div><span className="font-medium">PSU {index + 1}:</span> {psu.model || 'Unknown model'}</div>
                          <div>Status: {psu.status || 'Unknown'}</div>
                          {psu.powerCapacityWatts && <div>Capacity: {psu.powerCapacityWatts}W</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-6">
              {/* Processors */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Processors</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Processor Count</dt>
                      <dd className="text-sm text-gray-900">{server.processorCount || 'Not available'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Cores</dt>
                      <dd className="text-sm text-gray-900">{server.totalCores || 'Not available'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Threads</dt>
                      <dd className="text-sm text-gray-900 font-medium text-blue-600">{server.totalThreads || 'Not available'}</dd>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <dt className="text-sm font-medium text-gray-500">Processor Model</dt>
                      <dd className="text-sm text-gray-900">{server.processorModel || 'Not available'}</dd>
                    </div>
                  </dl>
                  {server.processorDetails && server.processorDetails.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Processor Details</h5>
                      <div className="space-y-2">
                        {server.processorDetails.map((proc, index) => (
                          <div key={index} className="text-xs bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900 mb-1">
                              {typeof proc.socket === 'object' ? JSON.stringify(proc.socket) : (proc.socket || `CPU ${index + 1}`)}: {typeof (proc.model || proc.name) === 'object' ? JSON.stringify(proc.model || proc.name) : (proc.model || proc.name)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-gray-600">
                              {proc.totalCores && (
                                <div>Cores: <span className="font-medium">{proc.totalCores}</span></div>
                              )}
                              {proc.totalThreads && (
                                <div>Threads: <span className="font-medium text-blue-600">{proc.totalThreads}</span></div>
                              )}
                              {proc.maxSpeedMHz && (
                                <div>Speed: <span className="font-medium">{proc.maxSpeedMHz} MHz</span></div>
                              )}
                              {proc.status && (
                                <div>Status: <span className={`font-medium ${proc.status === 'OK' ? 'text-green-600' : 'text-yellow-600'}`}>{proc.status}</span></div>
                              )}
                            </div>
                            {proc.manufacturer && (
                              <div className="text-gray-500 mt-1">{typeof proc.manufacturer === 'object' ? JSON.stringify(proc.manufacturer) : proc.manufacturer}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Memory */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Memory</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Memory</dt>
                      <dd className="text-sm text-gray-900">{server.totalMemoryGB ? `${server.totalMemoryGB} GB` : 'Not available'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Memory Modules</dt>
                      <dd className="text-sm text-gray-900">{server.memoryModules || 'Not available'}</dd>
                    </div>
                  </dl>
                  {server.memoryDetails && server.memoryDetails.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Memory Module Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {server.memoryDetails.map((mem, index) => (
                          <div key={index} className="text-xs bg-white p-3 rounded border">
                            {/* Header with Processor and Socket */}
                            <div className="font-medium text-gray-900 mb-1">
                              {mem.processor && mem.dimmSlot ?
                                `Processor ${mem.processor} • Socket ${mem.dimmSlot}` :
                                (typeof (mem.deviceLocator || mem.location) === 'object'
                                  ? JSON.stringify(mem.deviceLocator || mem.location)
                                  : (mem.deviceLocator || mem.location || `Slot ${index + 1}`)
                                )
                              }
                            </div>

                            {/* Size information */}
                            <div className="text-gray-600">
                              {mem.capacityMiB ?
                                `${Math.round(mem.capacityMiB / 1024)} GB` :
                                (server.totalMemoryGB && server.memoryModules ?
                                  `~${Math.round(server.totalMemoryGB / server.memoryModules)} GB` :
                                  'Size: Not available'
                                )
                              }
                            </div>

                            {/* Type information */}
                            <div className="text-gray-600">
                              {typeof (mem.memoryDeviceType || mem.memoryType) === 'object'
                                ? JSON.stringify(mem.memoryDeviceType || mem.memoryType)
                                : (mem.memoryDeviceType || mem.memoryType || 'Type: Not available')
                              }
                            </div>

                            {/* Manufacturer and Part Number */}
                            {mem.manufacturer && (
                              <div className="text-gray-600">
                                {typeof mem.manufacturer === 'object' ? JSON.stringify(mem.manufacturer) : mem.manufacturer.trim()}
                                {mem.partNumber && ` • ${typeof mem.partNumber === 'object' ? JSON.stringify(mem.partNumber) : mem.partNumber}`}
                              </div>
                            )}

                            {/* Enhanced Status with Color Coding */}
                            <div className={`text-xs mt-1 font-medium ${mem.status === 'OK' || mem.statusDetail === 'Good, In Use' ? 'text-green-600' :
                              mem.status === 'Warning' ? 'text-yellow-600' :
                                mem.status ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                              Status: {
                                typeof (mem.statusDetail || mem.status) === 'object'
                                  ? JSON.stringify(mem.statusDetail || mem.status)
                                  : (mem.statusDetail || mem.status || 'Not available')
                              }
                            </div>

                            {/* Additional Details */}
                            {(mem.speedMHz || mem.serialNumber) && (
                              <div className="text-gray-500 mt-1 text-xs">
                                {mem.speedMHz && `${typeof mem.speedMHz === 'object' ? JSON.stringify(mem.speedMHz) : mem.speedMHz} MHz`}
                                {mem.speedMHz && mem.serialNumber && ' • '}
                                {mem.serialNumber && `SN: ${typeof mem.serialNumber === 'object' ? JSON.stringify(mem.serialNumber) : mem.serialNumber}`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Storage */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Storage</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Storage Controllers</dt>
                      <dd className="text-sm text-gray-900">{server.storageControllers || 'Not available'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Storage</dt>
                      <dd className="text-sm text-gray-900">{server.totalStorageGB ? `${server.totalStorageGB} GB` : 'Not available'}</dd>
                    </div>
                  </dl>
                  {server.storageDetails && server.storageDetails.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Storage Controller Details</h5>
                      <div className="space-y-3">
                        {server.storageDetails.map((storage, index) => {
                          // Defensive programming - ensure storage object exists
                          if (!storage) return null;

                          return (
                            <div key={index} className="bg-white p-3 rounded border">
                              {/* Controller Header */}
                              <div className="font-medium text-gray-900 mb-2">
                                {storage.name || storage.model || `Controller ${index + 1}`}
                              </div>

                              {/* Controller Details */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                                <div>Status: <span className={`${storage.status === 'OK' ? 'text-green-600' : 'text-yellow-600'}`}>{storage.status || 'Unknown'}</span></div>
                                <div>Model: {storage.model || 'Not available'}</div>
                                {storage.serialNumber && <div>Serial: {storage.serialNumber}</div>}
                                {storage.firmwareVersion && (
                                  <div>Firmware: {
                                    typeof storage.firmwareVersion === 'object'
                                      ? (storage.firmwareVersion.Current?.VersionString || storage.firmwareVersion.VersionString || JSON.stringify(storage.firmwareVersion))
                                      : storage.firmwareVersion
                                  }</div>
                                )}
                                {storage.encryptionStatus && <div>Encryption: {storage.encryptionStatus}</div>}
                              </div>

                              {/* Physical Drives */}
                              {storage.drives && storage.drives.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Physical Drives ({storage.drives.length})</div>
                                  <div className="grid grid-cols-1 gap-1">
                                    {storage.drives.map((drive, driveIndex) => (
                                      <div key={driveIndex} className="text-xs bg-gray-50 p-2 rounded">
                                        <div className="font-medium">
                                          {typeof drive.location === 'object'
                                            ? (drive.location?.PartLocation?.ServiceLabel ||
                                              drive.location?.ServiceLabel ||
                                              JSON.stringify(drive.location) ||
                                              `Drive ${driveIndex + 1}`)
                                            : (drive.location || `Drive ${driveIndex + 1}`)
                                          }
                                        </div>
                                        <div className="text-gray-600">
                                          {typeof drive.model === 'object' ? JSON.stringify(drive.model) : drive.model} • {drive.capacityGB ? `${drive.capacityGB} GB` : 'Unknown size'} •
                                          <span className={`${drive.status === 'OK' ? 'text-green-600' : 'text-yellow-600'}`}> {typeof drive.status === 'object' ? JSON.stringify(drive.status) : (drive.status || 'Unknown')}</span>
                                        </div>
                                        {drive.serialNumber && <div className="text-gray-500">SN: {typeof drive.serialNumber === 'object' ? JSON.stringify(drive.serialNumber) : drive.serialNumber}</div>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Logical Drives */}
                              {storage.logicalDrives && storage.logicalDrives.length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-gray-700 mb-1">Logical Drives ({storage.logicalDrives.length})</div>
                                  <div className="grid grid-cols-1 gap-1">
                                    {storage.logicalDrives.map((logical, logicalIndex) => (
                                      <div key={logicalIndex} className="text-xs bg-blue-50 p-2 rounded">
                                        <div className="font-medium">{logical.name || `Logical Drive ${logicalIndex + 1}`}</div>
                                        <div className="text-gray-600">
                                          {logical.capacityGB ? `${logical.capacityGB} GB` : 'Unknown size'} •
                                          {logical.raidLevel || 'Unknown RAID'} •
                                          <span className={`${logical.status === 'OK' ? 'text-green-600' : 'text-yellow-600'}`}> {logical.status || 'Unknown'}</span>
                                        </div>
                                        {logical.logicalDriveType && <div className="text-gray-500">Type: {logical.logicalDriveType}</div>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Summary */}
                              <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                                Total Capacity: {
                                  storage.totalCapacityGB > 0 ? `${storage.totalCapacityGB} GB` :
                                    storage.drives && storage.drives.length > 0 ? 'Calculating...' :
                                      storage.logicalDrives && storage.logicalDrives.length > 0 ? 'See logical drives' :
                                        'No drives detected'
                                }
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thermal */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Thermal Status</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {server.temperatures && server.temperatures.length > 0 ? (
                    <div className="space-y-4">
                      {/* Temperature Sensors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {server.temperatures.map((temp, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900 text-sm mb-1">
                              {temp.name || temp.location || `Sensor ${index + 1}`}
                            </div>
                            <div className="text-lg font-bold mb-1">
                              <span className={`${temp.currentTemp > 80 ? 'text-red-600' :
                                temp.currentTemp > 70 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                {temp.currentTemp || temp.readingCelsius ? `${temp.currentTemp || temp.readingCelsius}°C` : 'N/A'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {temp.physicalContext && <div>Location: {temp.physicalContext}</div>}
                              {temp.status && (
                                <div className={`${temp.status === 'OK' ? 'text-green-600' :
                                  temp.status === 'Warning' ? 'text-yellow-600' :
                                    temp.status === 'Critical' ? 'text-red-600' :
                                      'text-gray-600'
                                  }`}>
                                  Status: {temp.status}
                                </div>
                              )}
                              {temp.upperThresholdCritical && (
                                <div className="text-gray-500">
                                  Critical: {temp.upperThresholdCritical}°C
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Thermal Summary */}
                      {server.thermalSummary && (
                        <div className="p-3 bg-blue-50 rounded border">
                          <div className="text-sm font-medium text-gray-700 mb-2">Thermal Summary</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <div className="text-gray-500">Sensors</div>
                              <div className="font-medium">{server.thermalSummary.temperatureCount || 0}</div>
                            </div>
                            {server.thermalSummary.avgTemperature && (
                              <div>
                                <div className="text-gray-500">Avg Temp</div>
                                <div className="font-medium">{server.thermalSummary.avgTemperature}°C</div>
                              </div>
                            )}
                            {server.thermalSummary.criticalTemps > 0 && (
                              <div>
                                <div className="text-gray-500">Critical</div>
                                <div className="font-medium text-red-600">{server.thermalSummary.criticalTemps}</div>
                              </div>
                            )}
                            {server.thermalSummary.warningTemps > 0 && (
                              <div>
                                <div className="text-gray-500">Warning</div>
                                <div className="font-medium text-yellow-600">{server.thermalSummary.warningTemps}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <p>No temperature data available</p>
                      <p className="text-sm text-gray-500 mt-2">Temperature sensors may not be accessible via this iLO version or endpoint</p>
                    </div>
                  )}

                  {/* Fan Information */}
                  {server.fans && server.fans.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Fan Status</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {server.fans.map((fan, index) => (
                          <div key={index} className="text-xs bg-white p-2 rounded border">
                            <div className="font-medium text-gray-900">
                              {fan.name || fan.location || `Fan ${index + 1}`}
                            </div>
                            <div className="text-gray-600">
                              {fan.speedPercent ? `${fan.speedPercent}%` :
                                fan.currentSpeed ? `${fan.currentSpeed} ${fan.speedUnits || 'RPM'}` : 'Speed: N/A'}
                            </div>
                            {fan.status && (
                              <div className={`${fan.status === 'OK' ? 'text-green-600' :
                                fan.status === 'Warning' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                Status: {fan.status}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Network Information</h4>

              {/* Custom Network Information */}
              <div className="space-y-4">
                {/* Server Network Connection */}
                {(server.networkInfo?.serverNetworkDescription || server.ipAddress) && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">🌐</span>
                      <h5 className="text-lg font-medium text-blue-900">Primary Server Network</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-blue-700">Server Name</dt>
                        <dd className="text-sm text-blue-900 font-semibold">{server.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-blue-700">IP Address</dt>
                        <dd className="text-sm text-blue-900 font-mono flex items-center space-x-2">
                          <span>{server.ipAddress}</span>
                          <button
                            onClick={() => handlePing(server.ipAddress, 'Server Network')}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
                            title={`Ping ${server.ipAddress}`}
                          >
                            <span>🏓</span>
                            <span>Ping</span>
                          </button>
                        </dd>
                      </div>

                      {/* Additional IP Addresses */}
                      {server.additionalIPs && server.additionalIPs.length > 0 && (
                        <div className="md:col-span-2">
                          <dt className="text-sm font-medium text-blue-700">Additional IP Addresses</dt>
                          <dd className="text-sm text-blue-900">
                            <div className="space-y-2">
                              {server.additionalIPs.map((ip, index) => (
                                <div key={index} className="flex items-center space-x-2 font-mono">
                                  <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">{ip}</span>
                                  <button
                                    onClick={() => handlePing(ip, `Additional IP ${index + 1}`)}
                                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
                                    title={`Ping ${ip}`}
                                  >
                                    <span>🏓</span>
                                    <span>Ping</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}

                      {server.networkInfo?.serverNetworkDescription && (
                        <div className="md:col-span-2">
                          <dt className="text-sm font-medium text-blue-700">Network Connection</dt>
                          <dd className="text-sm text-blue-900 font-semibold">{server.networkInfo.serverNetworkDescription}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* iLO Management Network */}
                {(server.networkInfo?.iloNetworkDescription || server.managementInterface?.ip) && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">🔧</span>
                      <h5 className="text-lg font-medium text-green-900">iLO Management Network</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-green-700">Management Type</dt>
                        <dd className="text-sm text-green-900 font-semibold">{server.managementInterface?.type || 'iLO'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-green-700">Management IP</dt>
                        <dd className="text-sm text-green-900 font-mono flex items-center space-x-2">
                          <span>{server.managementInterface?.ip}</span>
                          <button
                            onClick={() => handlePing(server.managementInterface?.ip, 'iLO Management')}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center space-x-1"
                            title={`Ping ${server.managementInterface?.ip}`}
                          >
                            <span>🏓</span>
                            <span>Ping</span>
                          </button>
                        </dd>
                      </div>

                      {/* Additional iLO IP Addresses */}
                      {server.managementInterface?.additionalIPs && server.managementInterface.additionalIPs.length > 0 && (
                        <div className="md:col-span-2">
                          <dt className="text-sm font-medium text-green-700">Additional Management IPs</dt>
                          <dd className="text-sm text-green-900">
                            <div className="space-y-2">
                              {server.managementInterface.additionalIPs.map((ip, index) => (
                                <div key={index} className="flex items-center space-x-2 font-mono">
                                  <span className="bg-green-100 px-2 py-1 rounded text-green-800">{ip}</span>
                                  <button
                                    onClick={() => handlePing(ip, `Additional iLO IP ${index + 1}`)}
                                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center space-x-1"
                                    title={`Ping ${ip}`}
                                  >
                                    <span>🏓</span>
                                    <span>Ping</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}

                      {server.networkInfo?.iloNetworkDescription && (
                        <div className="md:col-span-2">
                          <dt className="text-sm font-medium text-green-700">Network Connection</dt>
                          <dd className="text-sm text-green-900 font-semibold">{server.networkInfo.iloNetworkDescription}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Network Information */}
                {!server.networkInfo?.serverNetworkDescription && !server.networkInfo?.iloNetworkDescription && !server.ipAddress && !server.managementInterface?.ip && (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <span className="text-4xl mb-4 block">📡</span>
                    <p className="text-gray-600 mb-2">No network information configured</p>
                    <p className="text-sm text-gray-500">Edit the server to add network switch and port information</p>
                  </div>
                )}
              </div>

              {/* Network Information Note */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400">ℹ️</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Network Information</h4>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>This section displays the network switch and port information you configured when creating/editing the server, rather than auto-detected network interfaces.</p>
                      <p className="mt-1">To update network information, edit the server and modify the "Network Information" section.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">System Logs</h4>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {server.systemLogs ? `${server.systemLogs.length} entries` : 'No logs available'}
                  </span>
                  <button
                    onClick={handleSyncLogsOnly}
                    disabled={syncingLogs}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <span className={syncingLogs ? 'animate-spin' : ''}>📝</span>
                    <span>{syncingLogs ? 'Syncing...' : 'Sync Logs'}</span>
                  </button>
                </div>
              </div>
              {server.systemLogs && server.systemLogs.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {server.systemLogs.map((log, index) => (
                    <div key={index} className={`p-3 rounded border-l-4 ${log.severity === 'Critical' || log.severity === 'Error' ? 'border-red-500 bg-red-50' :
                      log.severity === 'Warning' ? 'border-yellow-500 bg-yellow-50' :
                        log.severity === 'OK' || log.severity === 'Informational' ? 'border-green-500 bg-green-50' :
                          'border-gray-500 bg-gray-50'
                      }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.severity === 'Critical' || log.severity === 'Error' ? 'bg-red-100 text-red-800' :
                              log.severity === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                                log.severity === 'OK' || log.severity === 'Informational' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {log.severity || 'Unknown'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {log.created ? new Date(log.created).toLocaleString() : 'Unknown time'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-900">{log.message || log.description || 'No message'}</p>
                          {log.messageId && (
                            <p className="mt-1 text-xs text-gray-500">ID: {log.messageId}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No system logs available</p>
                  <p className="text-sm text-gray-500 mt-2">Click "Sync from iLO" to retrieve system logs</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* iLO Credential Modal */}
      {showCredentialModal && iloCredentials && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowCredentialModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">iLO Credentials</h3>
                <p className="text-sm text-gray-600 mt-1">{iloCredentials.serverName}</p>
                <p className="text-xs text-gray-500">{iloCredentials.iloIP}</p>
              </div>

              {/* Credentials */}
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={iloCredentials.credentials.username}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-mono text-sm cursor-pointer"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      id="copy-username-btn"
                      onClick={() => copyToClipboard(iloCredentials.credentials.username, 'copy-username-btn')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={iloCredentials.credentials.password}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-mono text-sm cursor-pointer"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      id="copy-password-btn"
                      onClick={() => copyToClipboard(iloCredentials.credentials.password, 'copy-password-btn')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. iLO interface opened in new tab</li>
                  <li>2. Click username/password to select</li>
                  <li>3. Click "Copy" or Ctrl+C to copy</li>
                  <li>4. Paste into iLO login form</li>
                  <li>5. Click Login to access iLO</li>
                </ol>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => window.open(iloCredentials.iloUrl, '_blank')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  🌐 Open iLO Again
                </button>
                <button
                  onClick={() => setShowCredentialModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iLO Credential Input Modal */}
      {showCredentialInputModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowCredentialInputModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Enter iLO Credentials</h3>
                <p className="text-sm text-gray-600 mt-1">{server.name}</p>
                <p className="text-xs text-gray-500">{server.managementInterface?.ip}</p>
              </div>

              {/* Credential Input Form */}
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={credentialInputData.username}
                    onChange={(e) => setCredentialInputData({ ...credentialInputData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter iLO username"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={credentialInputData.password}
                    onChange={(e) => setCredentialInputData({ ...credentialInputData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter iLO password"
                    onKeyPress={(e) => e.key === 'Enter' && handleCredentialSubmit()}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This server doesn't have iLO credentials stored. Enter the credentials to sync data and save them for future use.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleCredentialSubmit}
                  disabled={!credentialInputData.username || !credentialInputData.password}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  🔄 Save & Sync
                </button>
                <button
                  onClick={() => setShowCredentialInputModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



// Simple Login Component
const SimpleLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('🔐 Attempting login...')
      const response = await apiCall(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })

      if (response && response.ok) {
        const data = await response.json()
        console.log('✅ Login successful')
        onLogin(data.user, data.token, data.refreshToken)
      } else if (response) {
        const error = await response.json()
        console.error('❌ Login failed:', error)
        alert(error.message || 'Login failed')
      } else {
        console.error('❌ No response from server')
        alert('Login failed. Cannot connect to server.')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      if (error.message.includes('Network error')) {
        alert(`Connection Error: ${error.message}`)
      } else {
        alert('Login failed. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🖥️</div>
          <h2 className="text-3xl font-bold text-gray-900">Sign in to IstqSERVERS</h2>
          <p className="mt-2 text-sm text-gray-600">IT Infrastructure Management System</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Use: <strong>admin</strong> / <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}


const ServersPage = ({ refreshKey }) => {
  const { hasPermission } = useAuth()
  const location = useLocation()
  const [servers, setServers] = useState([])
  const [filteredServers, setFilteredServers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedServer, setSelectedServer] = useState(null)
  const [showManagement, setShowManagement] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showExcelImport, setShowExcelImport] = useState(false)
  const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'grid'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDatacenter, setSelectedDatacenter] = useState('')


  // Always load servers when component mounts or refreshKey changes
  useEffect(() => {
    loadServers()
  }, [refreshKey])

  const loadServers = async () => {
    // Prevent multiple simultaneous API calls
    if (loading) {
      console.log('⏳ Already loading servers, skipping...')
      return
    }

    try {
      if (servers.length === 0) {
        setLoading(true)
      }
      console.log('🔄 Loading servers...')

      // Check if we have a token
      const token = localStorage.getItem('token')
      console.log('🔑 Token available:', token ? 'Yes' : 'No')

      if (!token) {
        console.error('❌ No authentication token found')
        setLoading(false)
        return
      }

      // Request all servers by setting a high limit
      const url = `${API_ENDPOINTS.SERVERS.BASE}?limit=10000`
      console.log('📡 Making API call to:', url)

      const response = await apiCall(url)
      console.log('📡 API response received:', response?.status)

      if (response && response.ok) {
        const data = await response.json()
        console.log(`✅ Loaded ${data.servers?.length || 0} servers from backend`)
        setServers(data.servers || [])
        setFilteredServers(data.servers || [])
      } else if (response) {
        console.error('❌ Failed to load servers:', response.status, response.statusText)
        alert(`Failed to load servers: ${response.status} ${response.statusText}`)
      } else {
        console.error('❌ No response received from server')
        alert('Failed to connect to server')
      }
    } catch (error) {
      console.error('❌ Error loading servers:', error)
      alert(`Error loading servers: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced backend-powered search functionality
  const performSearch = async (searchValue, datacenterFilter) => {
    try {
      setLoading(true)

      // Build query parameters for backend search
      const params = new URLSearchParams()
      if (searchValue && searchValue.trim()) {
        params.append('search', searchValue.trim())
      }
      if (datacenterFilter) {
        params.append('datacenter', datacenterFilter)
      }
      // Request all matching servers
      params.append('limit', '10000')

      const url = `${API_ENDPOINTS.SERVERS.BASE}${params.toString() ? '?' + params.toString() : '?limit=10000'}`
      console.log('🔍 Performing backend search:', url)

      const response = await apiCall(url)

      if (response && response.ok) {
        const data = await response.json()
        const serverList = data.servers || []

        // Update both servers and filtered servers with search results
        setServers(serverList)
        setFilteredServers(serverList)

        console.log(`🔍 Search completed: ${serverList.length} servers found`)

        // Show search feedback
        if (searchValue || datacenterFilter) {
          console.log(`📊 Search results: "${searchValue}" in ${datacenterFilter || 'all datacenters'}: ${serverList.length} servers`)
        }
      } else {
        console.error('❌ Search failed:', response?.status, response?.statusText)
        setServers([])
        setFilteredServers([])
      }
    } catch (error) {
      console.error('❌ Search error:', error)
      setServers([])
      setFilteredServers([])
    } finally {
      setLoading(false)
    }
  }

  // Handle search input change with debouncing
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // Debounce search to avoid too many API calls
    clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(() => {
      performSearch(value, selectedDatacenter)
    }, 500) // Wait 500ms after user stops typing
  }

  // Handle datacenter filter change
  const handleDatacenterFilter = (datacenter) => {
    setSelectedDatacenter(datacenter)
    performSearch(searchTerm, datacenter)
  }

  // Handle immediate search (for search button or Enter key)
  const handleImmediateSearch = () => {
    clearTimeout(window.searchTimeout)
    performSearch(searchTerm, selectedDatacenter)
  }

  // Get unique datacenters for filter dropdown
  const datacenters = [...new Set(servers.map(s => s.datacenter).filter(Boolean))].sort()

  const handleAddServer = () => {
    setShowAddForm(true)
  }

  const handleEditServer = (server) => {
    setSelectedServer(server)
    setShowAddForm(true)
  }

  const handleManageServer = (server) => {
    setSelectedServer(server)
    setShowManagement(true)
  }

  const handleDeleteServer = async (server) => {
    if (confirm(`Are you sure you want to delete ${server.name}?`)) {
      try {
        const response = await apiCall(API_ENDPOINTS.SERVERS.BY_ID(server._id), {
          method: 'DELETE'
        })

        if (response && response.ok) {
          await loadServers() // Reload servers from backend
        } else {
          alert('Failed to delete server')
        }
      } catch (error) {
        console.error('Error deleting server:', error)
        alert('Error deleting server')
      }
    }
  }

  const saveServer = async (serverData) => {
    try {
      const url = selectedServer
        ? API_ENDPOINTS.SERVERS.BY_ID(selectedServer._id)
        : API_ENDPOINTS.SERVERS.BASE

      const method = selectedServer ? 'PUT' : 'POST'

      const response = await apiCall(url, {
        method,
        body: JSON.stringify(serverData)
      })

      if (response && response.ok) {
        await loadServers() // Reload servers from backend
        setShowAddForm(false)
        setSelectedServer(null)
      } else if (response) {
        const error = await response.json()
        alert(`Failed to save server: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving server:', error)
      alert('Error saving server')
    }
  }

  const handleImportServers = async (serversToImport) => {
    try {
      let successCount = 0
      let errorCount = 0
      const errors = []

      for (const serverData of serversToImport) {
        try {
          const response = await apiCall(API_ENDPOINTS.SERVERS.BASE, {
            method: 'POST',
            body: JSON.stringify(serverData)
          })

          if (response && response.ok) {
            successCount++
          } else if (response) {
            const error = await response.json()
            errorCount++
            errors.push(`${serverData.name}: ${error.message || 'Unknown error'}`)
          } else {
            errorCount++
            errors.push(`${serverData.name}: Network error`)
          }
        } catch (error) {
          errorCount++
          errors.push(`${serverData.name}: ${error.message}`)
        }
      }

      // Show results
      let message = `Import completed!\n\n✅ Successfully imported: ${successCount} servers`
      if (errorCount > 0) {
        message += `\n❌ Failed to import: ${errorCount} servers`
        if (errors.length > 0) {
          message += `\n\nErrors:\n${errors.slice(0, 5).join('\n')}`
          if (errors.length > 5) {
            message += `\n... and ${errors.length - 5} more errors`
          }
        }
      }
      alert(message)

      // Reload servers and close import dialog
      await loadServers()
      setShowImport(false)

    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import servers: ' + error.message)
    }
  }

  const handleExportToNotepad = async (serverId = null) => {
    try {
      console.log(`📄 Exporting server${serverId ? ` ${serverId}` : 's'} for download...`)

      const url = serverId
        ? API_ENDPOINTS.SERVER_MANAGEMENT.EXPORT_NOTEPAD(serverId)
        : API_ENDPOINTS.SERVER_MANAGEMENT.EXPORT_ALL_NOTEPAD

      const response = await apiCall(url, {
        method: 'POST',
        body: JSON.stringify({})
      })

      if (response && response.ok) {
        // Get filename from response headers
        const fileName = response.headers.get('X-Export-Filename') ||
          `server-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
        const serversExported = response.headers.get('X-Servers-Exported') || '1'
        const exportType = response.headers.get('X-Export-Type') || 'export'

        // Get the text content
        const exportData = await response.text()

        // Create blob and download
        const blob = new Blob([exportData], { type: 'text/plain' })
        const downloadUrl = window.URL.createObjectURL(blob)

        // Create temporary download link
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        window.URL.revokeObjectURL(downloadUrl)

        alert(`📄 Server data exported successfully!\n\n✅ ${serversExported} server${parseInt(serversExported) > 1 ? 's' : ''} exported\n📁 File: ${fileName}\n\nFile downloaded to your Downloads folder.`)
        console.log('✅ Export successful:', { fileName, serversExported, exportType })
      } else if (response) {
        const error = await response.text()
        alert(`❌ Export failed: ${error}`)
        console.error('❌ Export failed:', error)
      }
    } catch (error) {
      console.error('❌ Export error:', error)
      alert(`❌ Failed to export: ${error.message}`)
    }
  }

  if (showManagement && selectedServer) {
    return <ServerManagement
      server={selectedServer}
      onBack={() => setShowManagement(false)}
      onExportToNotepad={handleExportToNotepad}
    />
  }

  if (showAddForm) {
    return <ServerForm
      server={selectedServer}
      onSave={saveServer}
      onCancel={() => {
        setShowAddForm(false)
        setSelectedServer(null)
      }}
    />
  }

  if (showImport) {
    return <ServerImport
      onImport={handleImportServers}
      onCancel={() => setShowImport(false)}
    />
  }

  if (showExcelImport) {
    return <ExcelImport
      onImportComplete={(result) => {
        console.log('Excel import completed:', result)
        loadServers() // Reload servers after import
        setShowExcelImport(false)
      }}
      onCancel={() => setShowExcelImport(false)}
    />
  }

  if (loading && servers.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🔄</div>
          <p className="text-gray-600 font-medium font-inter">Loading IT infrastructure...</p>
        </div>
      </div>
    )
  }


  const handleExportServerCSV = () => {
    if (filteredServers.length === 0) {
      alert('No servers to export based on current filters.');
      return;
    }

    // Create CSV content - One line per server
    let csvContent = "Server Name,IP Address,Network Description,Location\n"

    filteredServers.forEach(server => {
      // Get Network Description
      const networkDesc = server.networkInfo?.serverNetworkDescription || 'N/A'

      // Location string
      const location = `${server.location?.datacenter || ''} ${server.location?.rack || ''} ${server.location?.position || ''}`.trim() || 'N/A'

      // Escape fields for CSV if they contain commas
      const safeName = `"${(server.name || '').replace(/"/g, '""')}"`
      const safeIp = `"${(server.ipAddress || '').replace(/"/g, '""')}"`
      const safeDesc = `"${(networkDesc || '').replace(/"/g, '""')}"`
      const safeLoc = `"${(location || '').replace(/"/g, '""')}"`

      csvContent += `${safeName},${safeIp},${safeDesc},${safeLoc}\n`
    })

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `server_list_export_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExportSubnets = () => {
    // 1. Collect all iLO IPs
    const subnetMap = {};

    filteredServers.forEach(server => {
      const ip = server.managementInterface?.ip;
      if (ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        // Assume /24 subnet for now as per requirement
        const parts = ip.split('.');
        if (parts.length === 4) {
          const subnet = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;

          if (!subnetMap[subnet]) {
            subnetMap[subnet] = {
              count: 0,
              servers: []
            };
          }
          subnetMap[subnet].count++;
          subnetMap[subnet].servers.push(server.name);
        }
      }
    });

    if (Object.keys(subnetMap).length === 0) {
      alert('No iLO subnets found to export.');
      return;
    }

    // 2. Generate Report Content
    let reportContent = "iLO Subnet Aggregation Report\n";
    reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    reportContent += "Subnet             | Count | Servers\n";
    reportContent += "-------------------|-------|-----------------------------------\n";

    Object.keys(subnetMap).sort().forEach(subnet => {
      const info = subnetMap[subnet];
      const serverList = info.servers.slice(0, 5).join(', ') + (info.servers.length > 5 ? ` +${info.servers.length - 5} more` : '');
      reportContent += `${subnet.padEnd(19)}| ${info.count.toString().padEnd(6)}| ${serverList}\n`;
    });

    // 3. Download
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `ilo_subnet_report_${new Date().toISOString().slice(0, 10)}.txt`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExportIloIps = () => {
    if (filteredServers.length === 0) {
      alert('No servers to export based on current filters.');
      return;
    }

    // Create Text content - Just IPs, one per line
    let textContent = ""

    filteredServers.forEach(server => {
      // Get main iLO IP
      const iloIp = server.managementInterface?.ip

      // Get additional iLO IPs if any
      const additionalIps = server.managementInterface?.additionalIPs
        ? (Array.isArray(server.managementInterface.additionalIPs)
          ? server.managementInterface.additionalIPs
          : [server.managementInterface.additionalIPs])
        : []

      // Add main IP if it exists and looks valid
      if (iloIp && iloIp !== 'N/A') {
        textContent += `${iloIp}\n`
      }

      // Add additional IPs
      additionalIps.forEach(ip => {
        if (ip) {
          textContent += `${ip}\n`
        }
      })
    })

    // Create download link
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `ilo_ips_list_${new Date().toISOString().slice(0, 10)}.txt`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-3">🖥️</span>
              Server Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your HP iLO and Dell iDRAC servers
            </p>
          </div>
          <div className="flex space-x-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'grouped'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                🏢 Grouped
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                📊 Grid
              </button>
            </div>


            <button
              onClick={() => setShowImport(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              📊 Import Excel
            </button>
            <button
              onClick={() => setShowExcelImport(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              📁 Excel Import
            </button>
            <button
              onClick={handleExportSubnets}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              🌐 Export Subnets
            </button>
            <button
              onClick={handleExportServerCSV}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              📋 Export Server List
            </button>
            <button
              onClick={handleExportIloIps}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              📥 Export iLO IPs
            </button>
            <button
              onClick={handleAddServer}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Server
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Servers</dt>
                  <dd className="text-lg font-medium text-gray-900">{servers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Online</dt>
                  <dd className="text-lg font-medium text-green-600">
                    {servers.filter(s => s.status === 'online').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Offline</dt>
                  <dd className="text-lg font-medium text-red-600">
                    {servers.filter(s => s.status === 'offline').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🔧</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Managed</dt>
                  <dd className="text-lg font-medium text-blue-600">
                    {servers.filter(s => s.managementInterface?.enabled).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Advanced Backend Search
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="search"
                placeholder="Search by name, server IP, additional IPs, iLO IP, iLO additional IPs, iLO type, username, network info, location, vendor, model..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={(e) => e.key === 'Enter' && handleImmediateSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleImmediateSearch}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄' : '🔍'}
              </button>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedDatacenter('')
                  performSearch('', '')
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              🚀 <strong>Backend-powered search</strong> across all server fields including main IPs, additional IPs, iLO IPs, iLO additional IPs, network descriptions, Excel data, and management interfaces
            </p>
          </div>

          {/* Datacenter Filter */}
          <div>
            <label htmlFor="datacenter-filter" className="block text-sm font-medium text-gray-700 mb-2">
              🏢 Filter by Datacenter
            </label>
            <select
              id="datacenter-filter"
              value={selectedDatacenter}
              onChange={(e) => handleDatacenterFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Datacenters</option>
              {datacenters.map(dc => (
                <option key={dc} value={dc}>{dc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Results Info */}
        {(searchTerm || selectedDatacenter) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">📊</span>
              <span className="text-sm text-blue-800">
                Showing {filteredServers.length} of {servers.length} servers
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedDatacenter && ` in ${selectedDatacenter}`}
              </span>
              {(searchTerm || selectedDatacenter) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedDatacenter('')
                    performSearch('', '')
                  }}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Server Display */}
      {viewMode === 'grouped' ? (
        <ServerGroupView
          servers={filteredServers}
          onManage={handleManageServer}
          onEdit={handleEditServer}
          onDelete={handleDeleteServer}
          onExportToNotepad={handleExportToNotepad}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredServers.map((server) => (
            <ServerCard
              key={server._id || server.id}
              server={server}
              onManage={handleManageServer}
              onEdit={handleEditServer}
              onDelete={handleDeleteServer}
              onExportToNotepad={handleExportToNotepad}
            />
          ))}
        </div>
      )}

      {servers.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🖥️</span>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No servers</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first server.</p>
          <div className="mt-6">
            <button
              onClick={handleAddServer}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Server
            </button>
          </div>
        </div>
      )}

      {servers.length > 0 && filteredServers.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No servers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No servers match your current search criteria.
            {searchTerm && ` Try a different search term or `}
            {selectedDatacenter && ` Try a different datacenter or `}
            clear the filters to see all servers.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedDatacenter('')
                setFilteredServers(servers)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}




// Analytics Page Component
const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true)
  const [serversData, setServersData] = useState([])
  const [networkData, setNetworkData] = useState([])
  const [usersData, setUsersData] = useState([])

  // Color schemes for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']
  const DATACENTER_COLORS = {
    'Valencia': '#0088FE',
    'Madrid': '#00C49F',
    'AMS 5': '#FFBB28',
    'AMS EXA': '#FF8042',
    'Blades': '#8884D8'
  }

  // Load data on component mount
  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      console.log('📊 Loading analytics data...')

      const [serversResponse, networkResponse, usersResponse] = await Promise.all([
        apiCall(`${API_ENDPOINTS.SERVERS.BASE}?limit=2000`),
        apiCall(`${API_ENDPOINTS.NETWORK.BASE}/subnets`),
        apiCall(API_ENDPOINTS.USERS.BASE)
      ])

      if (serversResponse && serversResponse.ok) {
        const serversResult = await serversResponse.json()
        setServersData(serversResult.servers || [])
        console.log('✅ Servers data loaded:', serversResult.servers?.length || 0)
      }

      if (networkResponse && networkResponse.ok) {
        const networkResult = await networkResponse.json()
        setNetworkData(networkResult.subnets || [])
        console.log('✅ Network data loaded:', networkResult.subnets?.length || 0, 'subnets')
      }

      if (usersResponse && usersResponse.ok) {
        const usersResult = await usersResponse.json()
        setUsersData(usersResult.users || [])
        console.log('✅ Users data loaded:', usersResult.users?.length || 0)
      }

    } catch (error) {
      console.error('❌ Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Process data for charts
  const processDatacenterData = () => {
    const datacenterStats = {}
    serversData.forEach(server => {
      const dc = server.datacenter || 'Unknown'
      if (!datacenterStats[dc]) {
        datacenterStats[dc] = { name: dc, servers: 0, online: 0, offline: 0 }
      }
      datacenterStats[dc].servers++
      if (server.status === 'online') datacenterStats[dc].online++
      else datacenterStats[dc].offline++
    })
    return Object.values(datacenterStats)
  }

  const processServerSeriesData = () => {
    const seriesStats = {}
    serversData.forEach(server => {
      const match = server.name?.match(/^([0-9]+|b[0-9]+)-/)
      const series = match ? `Series ${match[1]}` : 'Unknown'
      seriesStats[series] = (seriesStats[series] || 0) + 1
    })
    return Object.entries(seriesStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
  }

  const processNetworkSubnetsData = () => {
    return networkData.slice(0, 10).map(subnet => ({
      subnet: subnet.subnet,
      totalIPs: subnet.totalIPs || 0,
      servers: subnet.serverCount || 0,
      datacenter: subnet.primaryDatacenter || 'Unknown',
      managementIPs: subnet.managementIPs || 0,
      additionalIPs: subnet.additionalIPs || 0
    }))
  }

  const processUserRolesData = () => {
    const roleStats = {}
    usersData.forEach(user => {
      const role = user.role || 'unknown'
      roleStats[role] = (roleStats[role] || 0) + 1
    })
    return Object.entries(roleStats).map(([name, value]) => ({ name, value }))
  }

  const processServerHealthData = () => {
    const healthStats = {
      'Configured Passwords': serversData.filter(s => s.password && s.password.trim() !== '').length,
      'Missing Passwords': serversData.filter(s => !s.password || s.password.trim() === '').length,
      'Configured iLO IPs': serversData.filter(s => s.managementInterface?.ip || s.management?.ipAddress).length,
      'Missing iLO IPs': serversData.filter(s => !(s.managementInterface?.ip || s.management?.ipAddress)).length,
      'Configured Network IPs': serversData.filter(s => s.ipAddress && s.ipAddress.trim() !== '').length,
      'Missing Network IPs': serversData.filter(s => !s.ipAddress || s.ipAddress.trim() === '').length,
      'With Additional IPs': serversData.filter(s => s.additionalIPs && s.additionalIPs.length > 0).length,
      'No Additional IPs': serversData.filter(s => !s.additionalIPs || s.additionalIPs.length === 0).length,
      'Complete Location Data': serversData.filter(s => s.location?.rack || s.location?.datacenter).length,
      'Missing Location Data': serversData.filter(s => !(s.location?.rack || s.location?.datacenter)).length
    }
    return Object.entries(healthStats).map(([name, value]) => ({
      name,
      value,
      status: name.includes('Missing') || name.includes('No ') ? 'critical' : 'healthy'
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  const datacenterData = processDatacenterData()
  const serverSeriesData = processServerSeriesData()
  const networkSubnetsData = processNetworkSubnetsData()
  const userRolesData = processUserRolesData()
  const serverHealthData = processServerHealthData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your IT infrastructure</p>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🖥️</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Servers</p>
              <p className="text-2xl font-bold text-gray-900">{serversData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🌐</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Network Subnets</p>
              <p className="text-2xl font-bold text-gray-900">{networkData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{usersData.filter(u => u.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🏢</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Datacenters</p>
              <p className="text-2xl font-bold text-gray-900">{datacenterData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Datacenter Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Datacenter Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datacenterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="servers" fill="#0088FE" name="Total Servers" />
              <Bar dataKey="online" fill="#00C49F" name="Online" />
              <Bar dataKey="offline" fill="#FF8042" name="Offline" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Server Series Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔢 Server Series Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serverSeriesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {serverSeriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Network Subnets Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 Top Network Subnets ({networkData.length} total)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={networkSubnetsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subnet" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Subnet: ${label}`}
              />
              <Legend />
              <Bar dataKey="totalIPs" fill="#FFBB28" name="Total IPs" />
              <Bar dataKey="servers" fill="#0088FE" name="Servers" />
              <Bar dataKey="managementIPs" fill="#00C49F" name="Management IPs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Roles Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 User Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRolesData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {userRolesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Additional Network Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Datacenter Network Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Network Distribution by Datacenter</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={networkData.slice(0, 15).map(subnet => ({
                  name: subnet.primaryDatacenter,
                  value: subnet.totalIPs
                })).reduce((acc, curr) => {
                  const existing = acc.find(item => item.name === curr.name)
                  if (existing) {
                    existing.value += curr.value
                  } else {
                    acc.push(curr)
                  }
                  return acc
                }, [])}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {networkData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DATACENTER_COLORS[entry.primaryDatacenter] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} IPs`, 'Total IPs']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Multi-Datacenter Subnets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Multi-Datacenter Subnets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={networkData.filter(subnet => subnet.isMultiDatacenter).slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subnet" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="datacenterCount" fill="#FF8042" name="Datacenters" />
              <Bar dataKey="totalIPs" fill="#FFBB28" name="Total IPs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Server Configuration Health Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Server Configuration Health ({serversData.length} servers)</h3>
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-2">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Critical Issue Detected</p>
              <p className="text-red-600 text-sm">All {serversData.length} servers are missing password configuration</p>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={serverHealthData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [value, 'Servers']}
              labelFormatter={(label) => `Configuration: ${label}`}
            />
            <Bar dataKey="value" fill="#8884D8">
              {serverHealthData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.status === 'critical' ? '#FF4444' : '#00C49F'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Configuration Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{serversData.filter(s => s.ipAddress).length}</div>
            <div className="text-sm text-green-700">Network IPs</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{serversData.filter(s => s.managementInterface?.ip || s.management?.ipAddress).length}</div>
            <div className="text-sm text-green-700">iLO IPs</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{serversData.filter(s => !s.password || s.password.trim() === '').length}</div>
            <div className="text-sm text-red-700">Missing Passwords</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{serversData.filter(s => s.additionalIPs && s.additionalIPs.length > 0).length}</div>
            <div className="text-sm text-blue-700">Additional IPs</div>
          </div>
        </div>
      </div>

    </div>
  )
}

// OneDrive Sync Management Page
const OneDriveSyncPage = () => {
  const [syncStatus, setSyncStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [triggering, setTriggering] = useState(false)

  useEffect(() => {
    loadSyncStatus()
  }, [])

  const loadSyncStatus = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/api/onedrive-sync/status')
      if (response && response.ok) {
        const data = await response.json()
        setSyncStatus(data.status)
        console.log('✅ Sync status loaded:', data.status)
      }
    } catch (error) {
      console.error('❌ Error loading sync status:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerSync = async () => {
    try {
      setTriggering(true)
      const response = await apiCall('/api/onedrive-sync/trigger', {
        method: 'POST'
      })
      if (response && response.ok) {
        const data = await response.json()
        console.log('✅ Sync triggered:', data.message)
        // Refresh status after a short delay
        setTimeout(loadSyncStatus, 2000)
      }
    } catch (error) {
      console.error('❌ Error triggering sync:', error)
    } finally {
      setTriggering(false)
    }
  }

  const uploadFile = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('excelFile', file)

      const response = await fetch('/api/onedrive-sync/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ File uploaded:', data.message)
        loadSyncStatus()
      }
    } catch (error) {
      console.error('❌ Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600">Loading sync status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OneDrive Excel Sync</h1>
          <p className="text-gray-600 mt-1">Automated server data synchronization from OneDrive</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadSyncStatus}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            🔄 Refresh Status
          </button>
          <button
            onClick={triggerSync}
            disabled={triggering || syncStatus?.syncInProgress}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {triggering ? '⏳ Triggering...' : '🚀 Trigger Sync'}
          </button>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Sync Status</h3>

        {syncStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{syncStatus.stats?.totalSyncs || 0}</div>
              <div className="text-sm text-blue-700">Total Syncs</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{syncStatus.stats?.successfulSyncs || 0}</div>
              <div className="text-sm text-green-700">Successful</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{syncStatus.stats?.failedSyncs || 0}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No sync status available</p>
        )}

        {syncStatus?.syncInProgress && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 text-xl mr-2">⏳</span>
              <div>
                <p className="text-yellow-800 font-medium">Sync in Progress</p>
                <p className="text-yellow-600 text-sm">Please wait while the sync operation completes...</p>
              </div>
            </div>
          </div>
        )}

        {syncStatus?.lastSyncTime && (
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Last Sync:</strong> {new Date(syncStatus.lastSyncTime).toLocaleString()}</p>
            <p><strong>Next Sync:</strong> {syncStatus.nextSyncTime}</p>
          </div>
        )}

        {/* Sync Now Button */}
        <div className="mt-6 text-center">
          <button
            onClick={triggerSync}
            disabled={triggering || syncStatus?.syncInProgress}
            className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
          >
            <span className={triggering ? 'animate-spin' : ''}>
              {triggering ? '⏳' : '🚀'}
            </span>
            <span>
              {triggering ? 'Downloading with Puppeteer...' : 'Sync Now (Puppeteer)'}
            </span>
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Download Excel file from OneDrive using browser automation (Puppeteer)
          </p>
        </div>
      </div>

      {/* Manual Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Manual Upload</h3>
        <p className="text-gray-600 mb-4">
          If OneDrive sync is not working, you can manually upload an Excel file here.
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={uploadFile}
            disabled={uploading}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
          >
            {uploading ? '⏳ Uploading...' : '📁 Select Excel File'}
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Upload your server data Excel file (.xlsx format)
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sync Interval</label>
            <p className="text-sm text-gray-600">Every 2 hours</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">OneDrive URL</label>
            <p className="text-sm text-gray-600 truncate">
              {syncStatus?.oneDriveUrl ?
                <a href={syncStatus.oneDriveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  View OneDrive File
                </a> :
                'Not configured'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Real Dashboard Component with Live Data
const RealDashboard = ({ refreshKey }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    servers: [],
    subnets: [],
    users: [],
    stats: {}
  })

  useEffect(() => {
    loadDashboardData()
  }, [refreshKey])

  const loadDashboardData = async () => {
    try {
      if (dashboardData.servers.length === 0) {
        setLoading(true)
      }
      console.log('📊 Loading dashboard data...')

      const [serversResponse, networkResponse, usersResponse] = await Promise.all([
        apiCall(`${API_ENDPOINTS.SERVERS.BASE}?limit=2000`),
        apiCall(`${API_ENDPOINTS.NETWORK.BASE}/subnets`),
        apiCall(API_ENDPOINTS.USERS.BASE)
      ])

      const servers = serversResponse?.ok ? (await serversResponse.json()).servers || [] : []
      const subnets = networkResponse?.ok ? (await networkResponse.json()).subnets || [] : []
      const users = usersResponse?.ok ? (await usersResponse.json()).users || [] : []

      // Calculate statistics
      const stats = {
        totalServers: servers.length,
        totalSubnets: subnets.length,
        totalUsers: users.length,
        serversWithPasswords: servers.filter(s => s.password && s.password.trim() !== '').length,
        serversWithILO: servers.filter(s => s.managementInterface?.ip || s.management?.ipAddress).length,
        activeUsers: users.filter(u => u.isActive).length,
        totalIPs: subnets.reduce((sum, subnet) => sum + (subnet.totalIPs || 0), 0),
        datacenters: [...new Set(servers.map(s => s.datacenter).filter(Boolean))].length
      }

      setDashboardData({ servers, subnets, users, stats })
      console.log('✅ Dashboard data loaded:', stats)

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && dashboardData.servers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">📊</div>
          <p className="text-gray-600 font-medium font-inter">Loading infrastructure data...</p>
        </div>
      </div>
    )
  }

  const { stats } = dashboardData

  // Process datacenter data
  const datacenterStats = dashboardData.servers.reduce((acc, server) => {
    const dc = server.datacenter || 'Unknown'
    acc[dc] = (acc[dc] || 0) + 1
    return acc
  }, {})

  const topDatacenters = Object.entries(datacenterStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <span className="text-3xl">🖥️</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of your IT infrastructure</p>
        </div>
      </div>

      {/* Critical Alert */}
      {stats.serversWithPasswords === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-red-600 text-2xl mr-3">🚨</span>
            <div>
              <h3 className="text-lg font-medium text-red-800">Critical Security Alert</h3>
              <p className="text-red-600 mt-1">All {stats.totalServers} servers are missing password configuration</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => window.location.href = '/servers'} className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🖥️</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Servers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalServers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{stats.datacenters} datacenters</p>
            </div>
          </div>
        </div>

        <div onClick={() => window.location.href = '/network'} className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🌐</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Network Subnets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSubnets}</p>
              <p className="text-sm text-gray-500">{stats.totalIPs.toLocaleString()} total IPs</p>
            </div>
          </div>
        </div>

        <div onClick={() => window.location.href = '/rack-view'} className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔧</div>
            <div>
              <p className="text-sm font-medium text-gray-600">iLO Management</p>
              <p className="text-3xl font-bold text-green-600">{stats.serversWithILO}</p>
              <p className="text-sm text-gray-500">{((stats.serversWithILO / stats.totalServers) * 100).toFixed(1)}% coverage</p>
            </div>
          </div>
        </div>

        <div onClick={() => window.location.href = '/users'} className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.activeUsers}</p>
              <p className="text-sm text-gray-500">of {stats.totalUsers} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Datacenter Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Datacenter Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topDatacenters.map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Servers']} />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Configuration Health */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Configuration Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'With iLO IP', value: stats.serversWithILO, fill: '#00C49F' },
                  { name: 'Missing iLO IP', value: stats.totalServers - stats.serversWithILO, fill: '#FF8042' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/servers'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🖥️</span>
              <div>
                <p className="font-medium text-gray-900">Manage Servers</p>
                <p className="text-sm text-gray-600">View and configure {stats.totalServers} servers</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/network'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌐</span>
              <div>
                <p className="font-medium text-gray-900">Network Analysis</p>
                <p className="text-sm text-gray-600">Analyze {stats.totalSubnets} subnets</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/analytics'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Detailed infrastructure insights</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Infrastructure Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Datacenters</h4>
            <div className="space-y-2">
              {topDatacenters.slice(0, 3).map(([dc, count]) => (
                <div key={dc} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{dc}</span>
                  <span className="text-sm font-medium text-gray-900">{count} servers</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">System Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Network Coverage</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">iLO Coverage</span>
                <span className="text-sm font-medium text-green-600">{((stats.serversWithILO / stats.totalServers) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Password Coverage</span>
                <span className="text-sm font-medium text-red-600">0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// Rack View Component
const RackView = () => {
  const { hasPermission } = useAuth()
  const navigate = useNavigate()
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDatacenter, setSelectedDatacenter] = useState('')
  const [selectedRack, setSelectedRack] = useState(null)
  const [rackData, setRackData] = useState({})

  useEffect(() => {
    console.log('🔄 RackView useEffect triggered')
    loadServers()
  }, [])

  const loadServers = async () => {
    // Prevent multiple simultaneous API calls
    if (loading) {
      console.log('⏳ Already loading servers, skipping...')
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Loading servers for rack view...')

      // Check if we have a token
      const token = localStorage.getItem('token')
      console.log('🔑 Token available:', token ? 'Yes' : 'No')

      if (!token) {
        console.error('❌ No authentication token found')
        setLoading(false)
        return
      }

      // Request all servers by setting a high limit
      const url = `${API_ENDPOINTS.SERVERS.BASE}?limit=10000`
      console.log('📡 Making API call to:', url)

      const response = await apiCall(url)
      console.log('📡 API response received:', response?.status)

      if (response && response.ok) {
        const data = await response.json()
        console.log(`✅ Loaded ${data.servers?.length || 0} servers for rack view`)
        const serverList = data.servers || []
        setServers(serverList)
        organizeServersByRack(serverList)
      } else if (response) {
        console.error('❌ Failed to load servers:', response.status, response.statusText)
        alert(`Failed to load servers: ${response.status} ${response.statusText}`)
      } else {
        console.error('❌ No response received from server')
        alert('Failed to connect to server')
      }
    } catch (error) {
      console.error('❌ Error loading servers:', error)
      alert(`Error loading servers: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const organizeServersByRack = (serverList) => {
    const organized = {}

    serverList.forEach(server => {
      // Skip servers without location data
      if (!server.location?.rack || !server.location?.position) {
        return
      }

      const datacenter = server.location.datacenter || server.datacenter || 'Unknown'
      const rack = server.location.rack
      const position = server.location.position

      if (!organized[datacenter]) {
        organized[datacenter] = {}
      }

      if (!organized[datacenter][rack]) {
        organized[datacenter][rack] = {}
      }

      organized[datacenter][rack][position] = server
    })

    console.log('🗄️ Organized servers by rack:', organized)
    setRackData(organized)
  }

  const getDatacenters = () => {
    return Object.keys(rackData).sort()
  }

  const getRacksForDatacenter = (datacenter) => {
    if (!rackData[datacenter]) return []
    return Object.keys(rackData[datacenter]).sort()
  }

  const getPositionsForRack = (datacenter, rack) => {
    if (!rackData[datacenter] || !rackData[datacenter][rack]) return []
    return Object.keys(rackData[datacenter][rack])
  }

  // Helper function to ping an IP address
  const pingIP = async (ip) => {
    try {
      console.log(`🔍 Pinging ${ip}...`)
      const response = await apiCall(`${API_ENDPOINTS.SERVERS.BASE}/ping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip })
      })

      if (response && response.ok) {
        const result = await response.json()
        if (result.success) {
          alert(`✅ Ping successful to ${ip}\nResponse time: ${result.responseTime || 'N/A'}ms`)
        } else {
          alert(`❌ Ping failed to ${ip}\nError: ${result.error || 'Unknown error'}`)
        }
      } else {
        alert(`❌ Failed to ping ${ip}\nServer error`)
      }
    } catch (error) {
      console.error('Ping error:', error)
      alert(`❌ Failed to ping ${ip}\nError: ${error.message}`)
    }
  }

  // Helper function to parse and format position strings
  const parsePosition = (position) => {
    if (!position) return { display: 'Unknown', units: 1, sortKey: 0 }

    // Handle complex positions like "001+002+003+004" or "01+02"
    if (position.includes('+')) {
      const parts = position.split('+').map(p => p.trim())
      const firstUnit = parseInt(parts[0]) || 0
      const lastUnit = parseInt(parts[parts.length - 1]) || firstUnit
      const unitCount = parts.length

      if (unitCount === 2) {
        return {
          display: `${parts[0]}-${parts[1]}`,
          units: 2,
          sortKey: firstUnit,
          tooltip: `Units ${parts[0]} to ${parts[1]} (${unitCount}U)`
        }
      } else if (unitCount > 2) {
        return {
          display: `${parts[0]}-${parts[parts.length - 1]}`,
          units: unitCount,
          sortKey: firstUnit,
          tooltip: `Units ${parts[0]} to ${parts[parts.length - 1]} (${unitCount}U)`
        }
      }
    }

    // Handle single positions or other formats
    const numericPosition = parseInt(position) || 0
    return {
      display: position,
      units: 1,
      sortKey: numericPosition,
      tooltip: `Unit ${position}`
    }
  }

  const renderRackView = (datacenter, rack) => {
    const positions = getPositionsForRack(datacenter, rack)

    // Sort positions by their numeric value for better display order
    const sortedPositions = positions.sort((a, b) => {
      const aParsed = parsePosition(a)
      const bParsed = parsePosition(b)
      return bParsed.sortKey - aParsed.sortKey // Descending order (top to bottom)
    })

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <span className="text-gray-400">📊</span>
              {rack}
            </h3>
            <span className="text-xs font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
              {positions.length} {positions.length === 1 ? 'server' : 'servers'}
            </span>
          </div>
        </div>

        <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
          {sortedPositions.map(position => {
            const server = rackData[datacenter][rack][position]
            const positionInfo = parsePosition(position)

            return (
              <div
                key={position}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => setSelectedRack({ datacenter, rack, position, server })}
              >
                <div className="flex items-stretch">
                  {/* U Position Sidebar */}
                  <div className="w-14 bg-gradient-to-b from-gray-100 to-gray-50 border-r border-gray-200 flex flex-col items-center justify-center py-3 px-2">
                    <span className="text-xs font-bold text-gray-600 mb-0.5">
                      {positionInfo.display}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wide">U</span>
                    {positionInfo.units > 1 && (
                      <span className="text-[9px] font-bold text-orange-600 mt-1 bg-orange-50 px-1.5 py-0.5 rounded">
                        {positionInfo.units}U
                      </span>
                    )}
                  </div>

                  {/* Server Info */}
                  <div className="flex-1 p-3 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-sm text-gray-900 truncate pr-2" title={server.name}>
                        {server.name}
                      </h4>
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${server.status === 'online' ? 'bg-green-500 shadow-sm shadow-green-500/50' :
                        server.status === 'offline' ? 'bg-red-500' :
                          server.status === 'maintenance' ? 'bg-yellow-500' :
                            'bg-gray-400'
                        }`} />
                    </div>

                    {/* IP Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(server.ipAddress || server.ip) && (
                        <div className="flex items-center gap-1 bg-blue-50 rounded px-1.5 py-0.5">
                          <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">NET</span>
                          <span className="text-[10px] text-blue-900 font-mono truncate max-w-[90px]">
                            {server.ipAddress || server.ip}
                          </span>
                        </div>
                      )}

                      {server.managementInterface?.ip && (
                        <div className="flex items-center gap-1 bg-purple-50 rounded px-1.5 py-0.5">
                          <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider">iLO</span>
                          <span className="text-[10px] text-purple-900 font-mono truncate max-w-[90px]">
                            {server.managementInterface.ip}
                          </span>
                        </div>
                      )}

                      {server.additionalIPs && server.additionalIPs.length > 0 && (
                        <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          +{server.additionalIPs.length}
                        </span>
                      )}
                    </div>

                    {/* Hardware Specs (compact) */}
                    {(server.processorDetails || server.totalMemoryGB) && (
                      <div className="text-[10px] text-gray-500 flex items-center gap-2">
                        {server.processorDetails && (
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400">⚙️</span>
                            {server.processorDetails.reduce((sum, proc) => sum + (proc.totalThreads || 0), 0)}th
                          </span>
                        )}
                        {server.totalMemoryGB && (
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400">💾</span>
                            {server.totalMemoryGB}GB
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute inset-0 border-2 border-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const datacenters = getDatacenters()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🗄️</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rack View</h1>
            <p className="text-sm text-gray-500 mt-0.5">Physical datacenter rack visualization</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedDatacenter}
            onChange={(e) => setSelectedDatacenter(e.target.value)}
            className="px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All Datacenters</option>
            {datacenters.map(dc => (
              <option key={dc} value={dc}>{dc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">{datacenters.length}</div>
              <div className="text-xs font-medium text-blue-600 mt-1">Datacenters</div>
            </div>
            <span className="text-3xl opacity-50">🏢</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-700">
                {Object.values(rackData).reduce((total, dc) => total + Object.keys(dc).length, 0)}
              </div>
              <div className="text-xs font-medium text-green-600 mt-1">Total Racks</div>
            </div>
            <span className="text-3xl opacity-50">📊</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-700">{servers.length}</div>
              <div className="text-xs font-medium text-purple-600 mt-1">Total Servers</div>
            </div>
            <span className="text-3xl opacity-50">🖥️</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-700">
                {servers.filter(s => s.location?.rack && s.location?.position).length}
              </div>
              <div className="text-xs font-medium text-orange-600 mt-1">Positioned Servers</div>
            </div>
            <span className="text-3xl opacity-50">📍</span>
          </div>
        </div>
      </div>

      {/* Datacenter Sections */}
      {datacenters
        .filter(dc => !selectedDatacenter || dc === selectedDatacenter)
        .map(datacenter => (
          <div key={datacenter} className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-2xl">🏢</span>
                  {datacenter}
                </h2>
                <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                  {getRacksForDatacenter(datacenter).length} {getRacksForDatacenter(datacenter).length === 1 ? 'rack' : 'racks'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {getRacksForDatacenter(datacenter).map(rack => (
                <div key={rack}>
                  {renderRackView(datacenter, rack)}
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Server Detail Modal */}
      {selectedRack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                🖥️ Server Details - {selectedRack.server.name}
                <span className="ml-3 text-sm text-gray-500 bg-white px-2 py-1 rounded">
                  {selectedRack.datacenter} / {selectedRack.rack} / Position {selectedRack.position}
                </span>
              </h3>
              <button
                onClick={() => setSelectedRack(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column - Network Information */}
                <div className="space-y-6">
                  {/* Basic Server Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      📋 Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Server Name</dt>
                        <dd className="text-lg font-semibold text-gray-900">{selectedRack.server.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Location</dt>
                        <dd className="text-sm text-gray-900">
                          {selectedRack.datacenter} / {selectedRack.rack} / Position {selectedRack.position}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Status</dt>
                        <dd className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${selectedRack.server.status === 'online' ? 'bg-green-400' :
                            selectedRack.server.status === 'offline' ? 'bg-red-400' :
                              selectedRack.server.status === 'maintenance' ? 'bg-yellow-400' :
                                selectedRack.server.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                            }`}></span>
                          <span className="text-sm text-gray-900 capitalize">
                            {selectedRack.server.status || 'Unknown'}
                          </span>
                        </dd>
                      </div>
                      {selectedRack.server.serialNumber && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Serial Number</dt>
                          <dd className="text-sm text-gray-900">{selectedRack.server.serialNumber}</dd>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Network Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      🌐 Network Information
                    </h4>

                    {/* Primary Server Network */}
                    {(selectedRack.server.ipAddress || selectedRack.server.ip) && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            🌐 Primary Server Network
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="font-medium text-gray-600">Server Name</dt>
                            <dd className="text-gray-900">{selectedRack.server.name}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600">IP Address</dt>
                            <dd className="text-gray-900 flex items-center">
                              {selectedRack.server.ipAddress || selectedRack.server.ip}
                              <button
                                onClick={() => pingIP(selectedRack.server.ipAddress || selectedRack.server.ip)}
                                className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                🔍 Ping
                              </button>
                            </dd>
                          </div>
                          {selectedRack.server.additionalIPs && selectedRack.server.additionalIPs.length > 0 && (
                            <div className="col-span-2">
                              <dt className="font-medium text-gray-600 mb-1">Additional IP Addresses</dt>
                              <div className="space-y-1">
                                {selectedRack.server.additionalIPs.map((ip, index) => (
                                  <dd key={index} className="text-gray-900 flex items-center">
                                    {ip}
                                    <button
                                      onClick={() => pingIP(ip)}
                                      className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                      🔍 Ping
                                    </button>
                                  </dd>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedRack.server.networkConnection && (
                            <div className="col-span-2">
                              <dt className="font-medium text-gray-600">Network Connection</dt>
                              <dd className="text-gray-900">{selectedRack.server.networkConnection}</dd>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* iLO Management Network */}
                    {selectedRack.server.managementInterface?.ip && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                            🔧 iLO Management Network
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="font-medium text-gray-600">Management Type</dt>
                            <dd className="text-gray-900">iLO</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600">Management IP</dt>
                            <dd className="text-gray-900 flex items-center">
                              {selectedRack.server.managementInterface.ip}
                              <button
                                onClick={() => pingIP(selectedRack.server.managementInterface.ip)}
                                className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                🔍 Ping
                              </button>
                            </dd>
                          </div>
                          {selectedRack.server.managementInterface.networkConnection && (
                            <div className="col-span-2">
                              <dt className="font-medium text-gray-600">Network Connection</dt>
                              <dd className="text-gray-900">{selectedRack.server.managementInterface.networkConnection}</dd>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Hardware & Actions */}
                  <div className="space-y-6">
                    {/* Hardware Information */}
                    {(selectedRack.server.processorDetails || selectedRack.server.totalMemoryGB || selectedRack.server.storageDetails) && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          🔧 Hardware Specifications
                        </h4>
                        <div className="space-y-3">
                          {selectedRack.server.processorDetails && (
                            <div>
                              <dt className="text-sm font-medium text-gray-600">Processors</dt>
                              <dd className="text-sm text-gray-900">
                                {selectedRack.server.processorDetails.reduce((sum, proc) => sum + (proc.totalThreads || 0), 0)} threads
                                {selectedRack.server.processorDetails.length > 0 && (
                                  <span className="text-gray-500 ml-2">
                                    ({selectedRack.server.processorDetails.length} CPU{selectedRack.server.processorDetails.length > 1 ? 's' : ''})
                                  </span>
                                )}
                              </dd>
                            </div>
                          )}
                          {selectedRack.server.totalMemoryGB && (
                            <div>
                              <dt className="text-sm font-medium text-gray-600">Memory</dt>
                              <dd className="text-sm text-gray-900">{selectedRack.server.totalMemoryGB} GB RAM</dd>
                            </div>
                          )}
                          {selectedRack.server.storageDetails && (
                            <div>
                              <dt className="text-sm font-medium text-gray-600">Storage</dt>
                              <dd className="text-sm text-gray-900">{selectedRack.server.storageDetails}</dd>
                            </div>
                          )}
                          {selectedRack.server.model && (
                            <div>
                              <dt className="text-sm font-medium text-gray-600">Model</dt>
                              <dd className="text-sm text-gray-900">{selectedRack.server.model}</dd>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Management Actions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        ⚡ Quick Actions
                      </h4>
                      <div className="space-y-3">
                        {selectedRack.server.managementInterface?.ip && (
                          <button
                            onClick={() => {
                              const url = `https://${selectedRack.server.managementInterface.ip}`;
                              window.open(url, '_blank');
                            }}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 flex items-center justify-center"
                          >
                            🔗 Open iLO Interface
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const searchTerm = selectedRack.server.name;
                            navigate(`/servers?search=${encodeURIComponent(searchTerm)}`);
                            setSelectedRack(null);
                          }}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center justify-center"
                        >
                          📊 View in Servers Tab
                        </button>
                        <button
                          onClick={() => setSelectedRack(null)}
                          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>

                    {/* Additional Information */}
                    {(selectedRack.server.notes || selectedRack.server.lastUpdated) && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          📝 Additional Information
                        </h4>
                        <div className="space-y-3">
                          {selectedRack.server.notes && (
                            <div>
                              <dt className="text-sm font-medium text-gray-600">Notes</dt>
                              <dd className="text-sm text-gray-900">{selectedRack.server.notes}</dd>
                            </div>
                          )}
                          {selectedRack.server.lastUpdated && (
                            <div>
                              <dt className="text-sm font-medium text-gray-600">Last Updated</dt>
                              <dd className="text-sm text-gray-900">
                                {new Date(selectedRack.server.lastUpdated).toLocaleString()}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Dashboard with Sidebar Layout
const SimpleDashboard = ({ user, onLogout }) => {
  const { hasPermission, hasRole } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSyncActive, setIsSyncActive] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const location = useLocation()
  const currentPage = location.pathname

  // Global Sync Monitoring
  useEffect(() => {
    let syncCheckInterval

    const checkSyncStatus = async () => {
      try {
        const response = await apiCall('/api/automation/jobs')
        if (response && response.ok) {
          const data = await response.json()
          const activeJob = data.jobs?.find(j => j.status === 'running')

          if (activeJob) {
            setIsSyncActive(true)
            setSyncProgress(activeJob.progress || 0)
            // Trigger a refresh of current visible data if sync is active
            setRefreshKey(prev => prev + 1)
          } else {
            if (isSyncActive) {
              // Sync just finished, do one last big refresh
              setRefreshKey(prev => prev + 1)
            }
            setIsSyncActive(false)
            setSyncProgress(0)
          }
        }
      } catch (err) {
        console.warn('Failed to check sync status:', err)
      }
    }

    // Check immediately and then every 8 seconds (less aggressive to avoid overload)
    checkSyncStatus()
    syncCheckInterval = setInterval(checkSyncStatus, 8000)

    return () => clearInterval(syncCheckInterval)
  }, [isSyncActive])

  // Keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        setCollapsed(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isSyncActive={isSyncActive}
        syncProgress={syncProgress}
      />

      {/* Main content */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'md:pl-16' : 'md:pl-64'
        }`}>
        {/* Header */}
        <Header
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={collapsed}
          setSidebarCollapsed={setCollapsed}
        />

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

              {/* Page Content Based on Current Page */}
              {currentPage === '/dashboard' && (
                <RealDashboard refreshKey={refreshKey} />
              )}

              {/* Servers Page */}
              {currentPage === '/servers' && (
                hasPermission('servers.read') ? (
                  <ServersPage refreshKey={refreshKey} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              )}

              {/* Rack View Page */}
              {currentPage === '/rack-view' && (
                hasPermission('servers.read') ? (
                  <RackView refreshKey={refreshKey} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              )}

              {/* Network Page */}
              {currentPage === '/network' && (
                hasPermission('network.read') ? (
                  <NetworkAnalysisPage refreshKey={refreshKey} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              )}

              {/* Analytics Page */}
              {currentPage === '/analytics' && (
                console.log('📈 Rendering analytics page') ||
                <AnalyticsPage key="analytics-page" />
              )}

              {/* OneDrive Sync Page */}
              {currentPage === '/onedrive-sync' && (
                console.log('🔄 Rendering OneDrive sync page') ||
                <OneDriveSyncPage key="onedrive-sync-page" />
              )}

              {/* Users Page */}
              {currentPage === '/users' && (
                hasPermission('users.read') ? (
                  console.log('👥 Rendering users page') ||
                  <UsersPage key="users-page" />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              )}


              {/* Orders Page */}
              {currentPage === '/orders' && (
                hasPermission('orders.read') ? (
                  <OrderManagement key="orders-page" />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              )}


              {/* Other Pages */}
              {currentPage !== '/dashboard' && currentPage !== '/servers' && currentPage !== '/rack-view' && currentPage !== '/network' && currentPage !== '/analytics' && currentPage !== '/onedrive-sync' && currentPage !== '/users' && currentPage !== '/orders' && (
                (() => {
                  const item = navigation.find(i => i.href === currentPage);
                  return (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 text-primary-500">
                        {item?.icon ? <item.icon className="h-16 w-16 mx-auto" /> : '📄'}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {item?.name || 'Page'}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        This section is ready for implementation.
                      </p>
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-sm text-primary-700">
                          The navigation is working! This page will be implemented with full functionality.
                        </p>
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Checking session...')
      const token = localStorage.getItem('token')
      console.log('🔑 Token found:', token ? 'Yes' : 'No')

      if (token) {
        try {
          console.log('📡 Calling profile API...')
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          console.log('📡 Profile API response:', response.status)

          if (response.ok) {
            const userData = await response.json()
            console.log('✅ Session restored for user:', userData.user.username)
            setUser(userData.user)
          } else {
            console.log('❌ Token invalid, status:', response.status)
            // Token is invalid, remove it
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
          }
        } catch (error) {
          console.error('❌ Session check failed:', error)
          // Don't use stored user data as fallback without a valid token
          console.log('🧹 Clearing invalid session data')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      } else {
        console.log('ℹ️ No token found - user needs to login')
        // Clear any stored user data without a valid token
        localStorage.removeItem('user')
      }
      setLoading(false)
    }

    checkSession()
  }, [])

  const handleLogin = (userData, token, refreshToken) => {
    console.log('💾 Saving login data...')
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
    console.log('✅ Login data saved')
  }

  const handleLogout = () => {
    console.log('🚪 Logging out...')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    console.log('✅ Logout complete')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🖥️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">IstqSERVERS</h2>
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600 mt-4">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <SimpleLogin onLogin={handleLogin} />}
      />

      <Route
        path="/dashboard"
        element={user ? (user.role === 'hardware' ? <Navigate to="/orders" replace /> : <SimpleDashboard user={user} onLogout={handleLogout} />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/servers"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/rack-view"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/network"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/analytics"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/onedrive-sync"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/monitoring"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/automation"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/orders"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/users"
        element={user ? <SimpleDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/"
        element={<Navigate to={user ? (user.role === 'hardware' ? "/orders" : "/dashboard") : "/login"} replace />}
      />

      <Route
        path="*"
        element={<Navigate to={user ? (user.role === 'hardware' ? "/orders" : "/dashboard") : "/login"} replace />}
      />
    </Routes>
  )
}

export default App
