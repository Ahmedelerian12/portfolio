// API Configuration for Dummy Website
// All API calls return dummy data - no real backend needed

import { dummyServers, dummySubnets, dummyNetworkSummary, dummySwitches, dummyUser, dummyUsers, dummyOrders, dummyJobs, dummySyncStatus, dummyDashboardData } from '../dummyData'

// Export the API base URL (not used in dummy mode but kept for compatibility)
export const API_BASE_URL = ''

// Export common API endpoints (kept for compatibility - same structure)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },
  SERVERS: {
    BASE: '/api/servers',
    BY_ID: (id) => `/api/servers/${id}`,
  },
  SERVER_MANAGEMENT: {
    BASE: '/api/server-management',
    BY_ID: (id) => `/api/server-management/${id}`,
    SYNC: (id) => `/api/server-management/${id}/sync`,
    PING: (id) => `/api/server-management/${id}/ping`,
    OPEN_ILO: (id) => `/api/server-management/${id}/open-ilo`,
    EXPORT_NOTEPAD: (id) => `/api/server-management/${id}/export-notepad`,
    EXPORT_ALL_NOTEPAD: '/api/server-management/export-notepad',
  },
  EXCEL_IMPORT: {
    SERVERS: '/api/excel-import/servers',
    STATUS: '/api/excel-import/status',
    BY_DATACENTER: (datacenter) => `/api/excel-import/servers/${datacenter}`,
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id) => `/api/users/${id}`,
  },
  NETWORK: {
    BASE: '/api/network',
    SWITCHES: '/api/network/switches',
  },
  MONITORING: {
    BASE: '/api/monitoring',
  },
  AUTOMATION: {
    BASE: '/api/automation',
  },
  ORDERS: {
    BASE: '/api/orders',
    BY_ID: (id) => `/api/orders/${id}`,
  },
}

// Helper function to get authorization headers (dummy)
export const getAuthHeaders = () => {
  return {
    'Authorization': 'Bearer dummy-token-for-demo',
    'Content-Type': 'application/json'
  }
}

// Create a fake Response object
const createFakeResponse = (data, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  }
}

// Route dummy API calls to return appropriate dummy data
const routeDummyCall = (url, options = {}) => {
  const method = options.method || 'GET'
  console.log(`🎭 DUMMY API Call: ${method} ${url}`)

  // Servers endpoints
  if (url.includes('/api/servers') && !url.includes('/server-management')) {
    if (url.includes('/summary') || url.includes('/stats')) {
      return createFakeResponse({
        totalServers: dummyServers.length,
        online: dummyServers.filter(s => s.status === 'online').length,
        offline: dummyServers.filter(s => s.status === 'offline').length,
        maintenance: dummyServers.filter(s => s.status === 'maintenance').length,
        datacenters: [...new Set(dummyServers.map(s => s.datacenter))],
      })
    }
    if (url.includes('/search')) {
      const q = new URL('http://localhost' + url).searchParams.get('q') || ''
      const filtered = dummyServers.filter(s =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.ipAddress.toLowerCase().includes(q.toLowerCase())
      )
      return createFakeResponse({ servers: filtered, total: filtered.length })
    }
    // Single server by ID
    const idMatch = url.match(/\/api\/servers\/([^/?]+)/)
    if (idMatch && idMatch[1] !== 'search' && idMatch[1] !== 'summary' && idMatch[1] !== 'stats') {
      const server = dummyServers.find(s => s._id === idMatch[1]) || dummyServers[0]
      return createFakeResponse({ server })
    }
    // All servers
    return createFakeResponse({
      servers: dummyServers,
      total: dummyServers.length,
      page: 1,
      limit: 1000,
    })
  }

  // Server management endpoints
  if (url.includes('/api/server-management')) {
    if (url.includes('/sync')) {
      return createFakeResponse({ success: true, message: 'Sync simulated (Demo Mode)' })
    }
    if (url.includes('/ping')) {
      return createFakeResponse({ success: true, reachable: true, responseTime: '12ms', message: 'Ping simulated (Demo Mode)' })
    }
    if (url.includes('/open-ilo')) {
      return createFakeResponse({ success: true, message: 'iLO open simulated (Demo Mode)' })
    }
    if (url.includes('/export-notepad')) {
      return createFakeResponse({ success: true, content: 'Demo server data export\n---\nServer: Demo Server\nIP: 10.20.0.10\nStatus: Online' })
    }
    if (url.includes('/info')) {
      return createFakeResponse({ data: { serverName: 'Demo Server', health: 'OK', firmware: 'v2.30' } })
    }
    if (url.includes('/power')) {
      return createFakeResponse({ data: { success: true, message: 'Power action simulated' } })
    }
    return createFakeResponse({ success: true })
  }

  // Network endpoints
  if (url.includes('/api/network')) {
    if (url.includes('/switches')) {
      return createFakeResponse({ switches: dummySwitches, count: dummySwitches.length })
    }
    if (url.includes('/subnets') && url.includes('/available-ips')) {
      return createFakeResponse({
        subnet: '10.20.0.0/24',
        usage: { total: 256, totalUsable: 254, used: 22, available: 232 },
        availableIPs: Array.from({ length: 10 }, (_, i) => `10.20.0.${200 + i}`),
      })
    }
    if (url.includes('/subnets')) {
      return createFakeResponse({
        subnets: dummySubnets,
        summary: dummyNetworkSummary,
      })
    }
    return createFakeResponse({ success: true })
  }

  // Auth endpoints
  if (url.includes('/api/auth')) {
    if (url.includes('/login')) {
      return createFakeResponse({
        user: dummyUser,
        token: 'dummy-token-for-demo',
        refreshToken: 'dummy-refresh-token',
      })
    }
    if (url.includes('/me') || url.includes('/profile')) {
      return createFakeResponse({ user: dummyUser })
    }
    return createFakeResponse({ success: true })
  }

  // Users endpoints
  if (url.includes('/api/users')) {
    return createFakeResponse({ users: dummyUsers, total: dummyUsers.length })
  }

  // Orders endpoints
  if (url.includes('/api/orders')) {
    return createFakeResponse({ success: true, orders: dummyOrders, total: dummyOrders.length })
  }

  // Automation endpoints
  if (url.includes('/api/automation')) {
    if (url.includes('/jobs')) {
      return createFakeResponse({ jobs: dummyJobs })
    }
    return createFakeResponse({ tasks: [], schedules: [], scripts: [] })
  }

  // OneDrive / Sync endpoints
  if (url.includes('/api/onedrive') || url.includes('/api/sync')) {
    return createFakeResponse(dummySyncStatus)
  }

  // Excel import endpoints
  if (url.includes('/api/excel-import')) {
    return createFakeResponse({ success: true, imported: 0, message: 'Import simulated (Demo Mode)' })
  }

  // System endpoints
  if (url.includes('/api/system')) {
    return createFakeResponse({ health: 'ok', uptime: '45 days', version: '1.0.0-demo' })
  }

  // Monitoring endpoints
  if (url.includes('/api/monitoring')) {
    return createFakeResponse({ dashboard: dummyDashboardData })
  }

  // Default fallback
  console.warn(`🎭 Unhandled dummy API route: ${url}`)
  return createFakeResponse({ success: true, message: 'Demo Mode - No real data' })
}

// Helper function for API calls - returns dummy data instead of making real requests
export const apiCall = async (url, options = {}) => {
  console.log(`🎭 DUMMY apiCall: ${options.method || 'GET'} ${url}`)

  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

  return routeDummyCall(url, options)
}

console.log('🎭 DUMMY API Configuration loaded - No backend required')
